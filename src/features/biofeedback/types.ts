export type BiofeedbackMeasurementType = "pre_session" | "post_session" | "standalone";

export type BiofeedbackDeviceMode = "rear_finger_scan" | "front_breath_assist" | "unknown";

export type BiofeedbackRawStatus = "ok" | "low_signal" | "timeout" | "permission_denied" | "unsupported" | "canceled";

export type BiofeedbackFailureReason =
  | "insufficient_light"
  | "high_motion"
  | "finger_not_detected"
  | "unstable_signal"
  | "permission_denied"
  | "torch_unavailable"
  | "camera_unavailable"
  | "timeout"
  | "canceled"
  | "unknown";

export interface PulseSample {
  t: number;
  red: number;
  green: number;
  blue: number;
  signal: number;
  redDominance: number;
  brightness: number;
}

export interface SignalQualityEvaluation {
  quality: number;
  status: BiofeedbackRawStatus;
  failureReason?: BiofeedbackFailureReason;
  metrics: {
    coverageRatio: number;
    motionStability: number;
    brightnessScore: number;
    sampleCount: number;
  };
}

export interface PulseEstimation {
  pulse: number | null;
  confidence: number;
  peakCount: number;
}

export interface PulseScanResult {
  pulse: number | null;
  breathingRate: number | null;
  signalQuality: number;
  durationMs: number;
  deviceMode: BiofeedbackDeviceMode;
  rawStatus: BiofeedbackRawStatus;
  failureReason?: BiofeedbackFailureReason;
  confidence: number;
}

export interface BaselineState {
  restingPulse: number;
  pulseSpread: number;
  sampleCount: number;
  version: number;
}

export interface CalmScoreInput {
  pulse: number | null;
  baselinePulse: number;
  signalQuality: number;
  breathingConsistency?: number | null;
  stillnessScore?: number | null;
  preToPostPulseDelta?: number | null;
}

export interface CalmScoreOutput {
  calmScore: number;
  recoveryScore: number;
  confidence: number;
  summary: string;
  level: "tense" | "neutral" | "calm";
}

export interface SessionEffectInput {
  preCalmScore: number;
  postCalmScore: number;
  prePulse: number | null;
  postPulse: number | null;
}

export interface SessionEffectOutput {
  sessionEffect: number;
  summary: string;
}

export interface BreathCoachMetrics {
  targetPaceLabel: string;
  adherenceScore: number | null;
  stillnessScore: number | null;
}

