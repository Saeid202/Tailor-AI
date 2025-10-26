"""
Point cloud processing and reconstruction utilities
"""
import numpy as np
import open3d as o3d
from typing import List, Tuple, Optional
from pathlib import Path

from src.utils.logger import logger
from src.utils.config_loader import get_config


class PointCloudProcessor:
    """Process and merge point clouds from multiple views"""
    
    def __init__(self):
        """Initialize point cloud processor"""
        self.config = get_config()
        self.voxel_size = self.config.get('reconstruction.voxel_size', 0.005)
        
        logger.info("Point cloud processor initialized")
    
    def create_point_cloud(
        self,
        points: np.ndarray,
        colors: Optional[np.ndarray] = None,
        normals: Optional[np.ndarray] = None
    ) -> o3d.geometry.PointCloud:
        """
        Create Open3D point cloud from numpy arrays
        
        Args:
            points: Nx3 array of 3D points
            colors: Nx3 array of RGB colors (0-1 range)
            normals: Nx3 array of normal vectors
            
        Returns:
            Open3D PointCloud object
        """
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)
        
        if colors is not None:
            pcd.colors = o3d.utility.Vector3dVector(colors)
        
        if normals is not None:
            pcd.normals = o3d.utility.Vector3dVector(normals)
        
        return pcd
    
    def downsample(self, pcd: o3d.geometry.PointCloud, voxel_size: Optional[float] = None) -> o3d.geometry.PointCloud:
        """
        Downsample point cloud using voxel grid
        
        Args:
            pcd: Input point cloud
            voxel_size: Voxel size for downsampling
            
        Returns:
            Downsampled point cloud
        """
        if voxel_size is None:
            voxel_size = self.voxel_size
        
        downsampled = pcd.voxel_down_sample(voxel_size)
        logger.info(f"Downsampled from {len(pcd.points)} to {len(downsampled.points)} points")
        
        return downsampled
    
    def remove_outliers(
        self,
        pcd: o3d.geometry.PointCloud,
        nb_neighbors: int = 20,
        std_ratio: float = 2.0
    ) -> o3d.geometry.PointCloud:
        """
        Remove statistical outliers from point cloud
        
        Args:
            pcd: Input point cloud
            nb_neighbors: Number of neighbors to analyze
            std_ratio: Standard deviation ratio threshold
            
        Returns:
            Cleaned point cloud
        """
        cleaned, ind = pcd.remove_statistical_outlier(nb_neighbors, std_ratio)
        logger.info(f"Removed {len(pcd.points) - len(cleaned.points)} outlier points")
        
        return cleaned
    
    def estimate_normals(
        self,
        pcd: o3d.geometry.PointCloud,
        radius: float = 0.1,
        max_nn: int = 30
    ) -> o3d.geometry.PointCloud:
        """
        Estimate surface normals for point cloud
        
        Args:
            pcd: Input point cloud
            radius: Search radius for normal estimation
            max_nn: Maximum number of neighbors
            
        Returns:
            Point cloud with normals
        """
        pcd.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=radius, max_nn=max_nn)
        )
        
        # Orient normals consistently
        pcd.orient_normals_consistent_tangent_plane(k=15)
        
        return pcd
    
    def register_point_clouds(
        self,
        source: o3d.geometry.PointCloud,
        target: o3d.geometry.PointCloud,
        method: str = "icp"
    ) -> Tuple[o3d.geometry.PointCloud, np.ndarray]:
        """
        Register (align) two point clouds
        
        Args:
            source: Source point cloud to transform
            target: Target point cloud (reference)
            method: Registration method ('icp', 'colored_icp', 'feature')
            
        Returns:
            Tuple of (transformed_source, transformation_matrix)
        """
        # Initial alignment using RANSAC
        if method == "feature":
            return self._register_feature_based(source, target)
        
        # ICP registration
        threshold = self.voxel_size * 2
        
        if method == "colored_icp":
            reg_p2p = o3d.pipelines.registration.registration_colored_icp(
                source, target, threshold,
                np.identity(4),
                o3d.pipelines.registration.TransformationEstimationForColoredICP(),
                o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=100)
            )
        else:
            reg_p2p = o3d.pipelines.registration.registration_icp(
                source, target, threshold,
                np.identity(4),
                o3d.pipelines.registration.TransformationEstimationPointToPlane(),
                o3d.pipelines.registration.ICPConvergenceCriteria(max_iteration=100)
            )
        
        transformation = reg_p2p.transformation
        source_transformed = source.transform(transformation)
        
        logger.info(f"Registration fitness: {reg_p2p.fitness:.4f}, RMSE: {reg_p2p.inlier_rmse:.4f}")
        
        return source_transformed, transformation
    
    def _register_feature_based(
        self,
        source: o3d.geometry.PointCloud,
        target: o3d.geometry.PointCloud
    ) -> Tuple[o3d.geometry.PointCloud, np.ndarray]:
        """Feature-based registration using FPFH"""
        # Downsample
        source_down = self.downsample(source, self.voxel_size * 2)
        target_down = self.downsample(target, self.voxel_size * 2)
        
        # Estimate normals
        source_down = self.estimate_normals(source_down, self.voxel_size * 4)
        target_down = self.estimate_normals(target_down, self.voxel_size * 4)
        
        # Compute FPFH features
        source_fpfh = o3d.pipelines.registration.compute_fpfh_feature(
            source_down,
            o3d.geometry.KDTreeSearchParamHybrid(radius=self.voxel_size * 5, max_nn=100)
        )
        target_fpfh = o3d.pipelines.registration.compute_fpfh_feature(
            target_down,
            o3d.geometry.KDTreeSearchParamHybrid(radius=self.voxel_size * 5, max_nn=100)
        )
        
        # RANSAC registration
        distance_threshold = self.voxel_size * 1.5
        result = o3d.pipelines.registration.registration_ransac_based_on_feature_matching(
            source_down, target_down, source_fpfh, target_fpfh,
            True, distance_threshold,
            o3d.pipelines.registration.TransformationEstimationPointToPoint(False),
            3, [
                o3d.pipelines.registration.CorrespondenceCheckerBasedOnEdgeLength(0.9),
                o3d.pipelines.registration.CorrespondenceCheckerBasedOnDistance(distance_threshold)
            ],
            o3d.pipelines.registration.RANSACConvergenceCriteria(100000, 0.999)
        )
        
        transformation = result.transformation
        source_transformed = source.transform(transformation)
        
        return source_transformed, transformation
    
    def merge_point_clouds(
        self,
        point_clouds: List[o3d.geometry.PointCloud],
        register: bool = True
    ) -> o3d.geometry.PointCloud:
        """
        Merge multiple point clouds into one
        
        Args:
            point_clouds: List of point clouds
            register: Whether to register clouds before merging
            
        Returns:
            Merged point cloud
        """
        if not point_clouds:
            return o3d.geometry.PointCloud()
        
        if len(point_clouds) == 1:
            return point_clouds[0]
        
        merged = point_clouds[0]
        
        for i, pcd in enumerate(point_clouds[1:], 1):
            if register:
                try:
                    pcd_aligned, _ = self.register_point_clouds(pcd, merged, method="colored_icp")
                    merged += pcd_aligned
                except:
                    logger.warning(f"Registration failed for cloud {i}, adding without alignment")
                    merged += pcd
            else:
                merged += pcd
            
            logger.info(f"Merged {i+1}/{len(point_clouds)} point clouds")
        
        # Clean up merged cloud
        merged = self.downsample(merged)
        merged = self.remove_outliers(merged)
        
        return merged
    
    def create_mesh_from_point_cloud(
        self,
        pcd: o3d.geometry.PointCloud,
        method: str = "poisson"
    ) -> o3d.geometry.TriangleMesh:
        """
        Create triangle mesh from point cloud
        
        Args:
            pcd: Input point cloud (must have normals)
            method: Reconstruction method ('poisson', 'ball_pivoting', 'alpha_shape')
            
        Returns:
            Triangle mesh
        """
        # Ensure normals are computed
        if not pcd.has_normals():
            pcd = self.estimate_normals(pcd)
        
        if method == "poisson":
            mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
                pcd, depth=9, width=0, scale=1.1, linear_fit=False
            )
            
            # Remove low-density vertices
            vertices_to_remove = densities < np.quantile(densities, 0.1)
            mesh.remove_vertices_by_mask(vertices_to_remove)
            
        elif method == "ball_pivoting":
            radii = [self.voxel_size * r for r in [1, 2, 4, 8]]
            mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_ball_pivoting(
                pcd, o3d.utility.DoubleVector(radii)
            )
            
        elif method == "alpha_shape":
            alpha = self.voxel_size * 3
            mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_alpha_shape(pcd, alpha)
        
        else:
            raise ValueError(f"Unknown mesh reconstruction method: {method}")
        
        # Clean up mesh
        mesh.remove_degenerate_triangles()
        mesh.remove_duplicated_triangles()
        mesh.remove_duplicated_vertices()
        mesh.remove_non_manifold_edges()
        
        # Compute normals
        mesh.compute_vertex_normals()
        
        logger.info(f"Created mesh with {len(mesh.vertices)} vertices and {len(mesh.triangles)} triangles")
        
        return mesh
    
    def smooth_mesh(
        self,
        mesh: o3d.geometry.TriangleMesh,
        iterations: int = 1
    ) -> o3d.geometry.TriangleMesh:
        """
        Smooth triangle mesh
        
        Args:
            mesh: Input mesh
            iterations: Number of smoothing iterations
            
        Returns:
            Smoothed mesh
        """
        smoothed = mesh.filter_smooth_simple(number_of_iterations=iterations)
        smoothed.compute_vertex_normals()
        
        return smoothed
    
    def save_point_cloud(self, pcd: o3d.geometry.PointCloud, filepath: Path):
        """Save point cloud to file"""
        o3d.io.write_point_cloud(str(filepath), pcd)
        logger.info(f"Point cloud saved to {filepath}")
    
    def save_mesh(self, mesh: o3d.geometry.TriangleMesh, filepath: Path):
        """Save mesh to file"""
        o3d.io.write_triangle_mesh(str(filepath), mesh)
        logger.info(f"Mesh saved to {filepath}")
    
    def visualize_point_cloud(self, pcd: o3d.geometry.PointCloud, window_name: str = "Point Cloud"):
        """Visualize point cloud"""
        o3d.visualization.draw_geometries([pcd], window_name=window_name)
    
    def visualize_mesh(self, mesh: o3d.geometry.TriangleMesh, window_name: str = "Mesh"):
        """Visualize mesh"""
        o3d.visualization.draw_geometries([mesh], window_name=window_name)

