"""
Advanced 3D body reconstruction using multi-view data
"""
import numpy as np
import cv2
from typing import List, Dict, Tuple, Optional
from pathlib import Path
import open3d as o3d

from src.vision.pose_detector import PoseLandmarks
from src.vision.orientation_detector import Orientation
from src.reconstruction.point_cloud_processor import PointCloudProcessor
from src.utils.logger import logger
from src.utils.config_loader import get_config


class MultiViewCapture:
    """Container for multi-view capture data"""
    
    def __init__(self):
        self.captures: Dict[str, Dict] = {
            'front': [],
            'left_side': [],
            'right_side': [],
            'back': []
        }
    
    def add_capture(
        self,
        orientation: Orientation,
        image: np.ndarray,
        landmarks: PoseLandmarks,
        depth_map: Optional[np.ndarray] = None,
        mask: Optional[np.ndarray] = None
    ):
        """Add a capture for specific orientation"""
        orientation_key = orientation.value
        if orientation_key in self.captures:
            self.captures[orientation_key].append({
                'image': image,
                'landmarks': landmarks,
                'depth_map': depth_map,
                'mask': mask
            })
    
    def get_captures(self, orientation: Orientation) -> List[Dict]:
        """Get all captures for specific orientation"""
        return self.captures.get(orientation.value, [])
    
    def has_complete_scan(self) -> bool:
        """Check if we have captures from all orientations"""
        return all(len(captures) > 0 for captures in self.captures.values())
    
    def get_total_captures(self) -> int:
        """Get total number of captures"""
        return sum(len(captures) for captures in self.captures.values())


class BodyReconstructor:
    """
    Advanced 3D body reconstruction from multiple views
    """
    
    def __init__(self):
        """Initialize body reconstructor"""
        self.config = get_config()
        self.point_cloud_processor = PointCloudProcessor()
        
        # Camera parameters (can be calibrated)
        self.focal_length = 525.0  # Typical webcam focal length
        self.camera_matrix = None
        self.dist_coeffs = None
        
        logger.info("Body reconstructor initialized")
    
    def set_camera_calibration(
        self,
        camera_matrix: np.ndarray,
        dist_coeffs: np.ndarray
    ):
        """
        Set camera calibration parameters
        
        Args:
            camera_matrix: 3x3 camera intrinsic matrix
            dist_coeffs: Distortion coefficients
        """
        self.camera_matrix = camera_matrix
        self.dist_coeffs = dist_coeffs
        logger.info("Camera calibration parameters set")
    
    def reconstruct_from_multi_view(
        self,
        captures: MultiViewCapture
    ) -> Tuple[o3d.geometry.PointCloud, o3d.geometry.TriangleMesh]:
        """
        Reconstruct 3D body model from multi-view captures
        
        Args:
            captures: Multi-view capture data
            
        Returns:
            Tuple of (point_cloud, mesh)
        """
        logger.info("Starting multi-view 3D reconstruction...")
        
        # Generate point clouds from each view
        point_clouds = []
        
        for orientation_name, orientation_captures in captures.captures.items():
            if not orientation_captures:
                continue
            
            logger.info(f"Processing {orientation_name} views ({len(orientation_captures)} captures)...")
            
            for i, capture_data in enumerate(orientation_captures):
                pcd = self._create_point_cloud_from_capture(capture_data, orientation_name)
                if pcd is not None:
                    point_clouds.append(pcd)
        
        if not point_clouds:
            logger.error("No valid point clouds generated")
            return o3d.geometry.PointCloud(), o3d.geometry.TriangleMesh()
        
        logger.info(f"Generated {len(point_clouds)} point clouds")
        
        # Merge point clouds with registration
        merged_cloud = self.point_cloud_processor.merge_point_clouds(point_clouds, register=True)
        
        logger.info(f"Merged point cloud: {len(merged_cloud.points)} points")
        
        # Create mesh from merged point cloud
        mesh = self.point_cloud_processor.create_mesh_from_point_cloud(merged_cloud, method="poisson")
        
        # Smooth mesh
        mesh = self.point_cloud_processor.smooth_mesh(mesh, iterations=2)
        
        logger.info("3D reconstruction complete")
        
        return merged_cloud, mesh
    
    def _create_point_cloud_from_capture(
        self,
        capture_data: Dict,
        orientation: str
    ) -> Optional[o3d.geometry.PointCloud]:
        """
        Create point cloud from single capture
        
        Args:
            capture_data: Capture data dictionary
            orientation: View orientation
            
        Returns:
            Point cloud or None
        """
        image = capture_data['image']
        depth_map = capture_data.get('depth_map')
        mask = capture_data.get('mask')
        landmarks = capture_data.get('landmarks')
        
        if depth_map is None:
            logger.warning(f"No depth map for {orientation} capture")
            return None
        
        h, w = image.shape[:2]
        
        # Camera parameters
        fx = fy = self.focal_length
        cx, cy = w / 2.0, h / 2.0
        
        # Create point cloud from depth
        points_3d, colors = self._depth_to_point_cloud(
            depth_map, image, fx, fy, cx, cy, mask
        )
        
        if len(points_3d) == 0:
            return None
        
        # Apply orientation-specific transformation
        points_3d = self._apply_orientation_transform(points_3d, orientation)
        
        # Create Open3D point cloud
        pcd = self.point_cloud_processor.create_point_cloud(points_3d, colors)
        
        # Clean up
        pcd = self.point_cloud_processor.downsample(pcd)
        pcd = self.point_cloud_processor.remove_outliers(pcd, nb_neighbors=20, std_ratio=2.0)
        
        return pcd
    
    def _depth_to_point_cloud(
        self,
        depth_map: np.ndarray,
        image: np.ndarray,
        fx: float,
        fy: float,
        cx: float,
        cy: float,
        mask: Optional[np.ndarray] = None
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Convert depth map to 3D points"""
        h, w = depth_map.shape
        
        # Normalize depth map
        depth_normalized = depth_map.copy()
        if depth_normalized.max() > 0:
            # Invert if necessary (MiDaS outputs inverse depth)
            depth_normalized = depth_normalized.max() - depth_normalized
            depth_normalized = depth_normalized / depth_normalized.max() * 3.0  # Scale to ~3 meters
        
        # Create coordinate grid
        u, v = np.meshgrid(np.arange(w), np.arange(h))
        
        # Apply mask if provided
        if mask is not None:
            valid_mask = mask > 0
        else:
            valid_mask = np.ones((h, w), dtype=bool)
        
        # Filter by valid depth
        valid_mask = valid_mask & (depth_normalized > 0.1) & (depth_normalized < 5.0)
        
        u = u[valid_mask]
        v = v[valid_mask]
        z = depth_normalized[valid_mask]
        
        # Convert to 3D
        x = (u - cx) * z / fx
        y = (v - cy) * z / fy
        
        points_3d = np.stack([x, y, z], axis=-1)
        
        # Get colors
        if len(image.shape) == 3:
            colors = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            colors = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        
        colors = colors[valid_mask] / 255.0
        
        return points_3d, colors
    
    def _apply_orientation_transform(
        self,
        points: np.ndarray,
        orientation: str
    ) -> np.ndarray:
        """
        Apply transformation based on capture orientation
        Aligns all views to a common coordinate system
        
        Args:
            points: Nx3 point array
            orientation: View orientation ('front', 'left_side', 'right_side', 'back')
            
        Returns:
            Transformed points
        """
        # Define rotation matrices for each orientation
        # Assumes front view is the reference (no rotation)
        
        if orientation == 'front':
            # No transformation needed
            return points
        
        elif orientation == 'back':
            # 180-degree rotation around Y axis
            rotation = np.array([
                [-1, 0, 0],
                [0, 1, 0],
                [0, 0, -1]
            ])
        
        elif orientation == 'left_side':
            # 90-degree rotation around Y axis
            rotation = np.array([
                [0, 0, 1],
                [0, 1, 0],
                [-1, 0, 0]
            ])
        
        elif orientation == 'right_side':
            # -90-degree rotation around Y axis
            rotation = np.array([
                [0, 0, -1],
                [0, 1, 0],
                [1, 0, 0]
            ])
        
        else:
            return points
        
        # Apply rotation
        transformed = points @ rotation.T
        
        return transformed
    
    def estimate_body_dimensions(
        self,
        mesh: o3d.geometry.TriangleMesh,
        landmarks: Optional[PoseLandmarks] = None
    ) -> Dict[str, float]:
        """
        Estimate basic body dimensions from mesh
        (Will be refined in measurements module)
        
        Args:
            mesh: 3D body mesh
            landmarks: Optional pose landmarks for reference
            
        Returns:
            Dictionary of estimated dimensions
        """
        vertices = np.asarray(mesh.vertices)
        
        # Calculate bounding box dimensions
        bbox_min = vertices.min(axis=0)
        bbox_max = vertices.max(axis=0)
        dimensions_bbox = bbox_max - bbox_min
        
        dimensions = {
            'height_estimate': float(dimensions_bbox[1] * 100),  # Y axis, convert to cm
            'width_estimate': float(dimensions_bbox[0] * 100),   # X axis
            'depth_estimate': float(dimensions_bbox[2] * 100),   # Z axis
        }
        
        logger.info(f"Estimated dimensions: {dimensions}")
        
        return dimensions
    
    def export_reconstruction(
        self,
        mesh: o3d.geometry.TriangleMesh,
        point_cloud: o3d.geometry.PointCloud,
        output_dir: Path,
        filename_prefix: str = "body_scan"
    ):
        """
        Export reconstruction results
        
        Args:
            mesh: Reconstructed mesh
            point_cloud: Merged point cloud
            output_dir: Output directory
            filename_prefix: Prefix for output files
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Export mesh in multiple formats
        formats = self.config.get('export.formats', ['obj', 'ply', 'stl'])
        
        for fmt in formats:
            mesh_path = output_dir / f"{filename_prefix}.{fmt}"
            self.point_cloud_processor.save_mesh(mesh, mesh_path)
        
        # Export point cloud
        pcd_path = output_dir / f"{filename_prefix}_pointcloud.ply"
        self.point_cloud_processor.save_point_cloud(point_cloud, pcd_path)
        
        logger.info(f"Reconstruction exported to {output_dir}")
    
    def optimize_mesh_for_manufacturing(
        self,
        mesh: o3d.geometry.TriangleMesh,
        target_triangles: int = 50000
    ) -> o3d.geometry.TriangleMesh:
        """
        Optimize mesh for CNC manufacturing
        
        Args:
            mesh: Input mesh
            target_triangles: Target number of triangles
            
        Returns:
            Optimized mesh
        """
        # Simplify if too many triangles
        current_triangles = len(mesh.triangles)
        
        if current_triangles > target_triangles:
            reduction_ratio = target_triangles / current_triangles
            mesh = mesh.simplify_quadric_decimation(target_triangles)
            logger.info(f"Mesh simplified from {current_triangles} to {len(mesh.triangles)} triangles")
        
        # Ensure watertight mesh
        mesh.remove_non_manifold_edges()
        mesh.remove_duplicated_vertices()
        mesh.remove_duplicated_triangles()
        
        # Recompute normals
        mesh.compute_vertex_normals()
        mesh.compute_triangle_normals()
        
        logger.info("Mesh optimized for manufacturing")
        
        return mesh

