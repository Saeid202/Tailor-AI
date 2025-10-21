export type GarmentType = 'shirt' | 't-shirt' | 'pant';

export type BodyRegion = 'upper' | 'lower';

export interface AvatarPoseConfig {
  armPosition: 'out' | 'down';
  legPosition: 'together' | 'apart';
  opacity: number;
}

export interface GarmentConfig {
  type: GarmentType;
  region: BodyRegion;
  requiredLandmarks: number[];
  avatarPose: AvatarPoseConfig;
}

export const GARMENT_CONFIGS: Record<GarmentType, GarmentConfig> = {
  'shirt': {
    type: 'shirt',
    region: 'upper',
    requiredLandmarks: [0, 11, 12, 13, 14, 15, 16, 23, 24], // nose, shoulders, elbows, wrists, hips
    avatarPose: { armPosition: 'out', legPosition: 'together', opacity: 0.3 }
  },
  't-shirt': {
    type: 't-shirt',
    region: 'upper',
    requiredLandmarks: [0, 11, 12, 13, 14, 15, 16, 23, 24],
    avatarPose: { armPosition: 'out', legPosition: 'together', opacity: 0.3 }
  },
  'pant': {
    type: 'pant',
    region: 'lower',
    requiredLandmarks: [23, 24, 25, 26, 27, 28], // hips, knees, ankles
    avatarPose: { armPosition: 'down', legPosition: 'apart', opacity: 0.3 }
  }
};
