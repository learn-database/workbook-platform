export const LTI_PACKAGE_STATUS = "scaffolded";

export interface LtiLaunchPlaceholder {
  issuer: string;
  clientId: string;
  deploymentId?: string;
}

export function describeLaunchPlaceholder(
  launch: LtiLaunchPlaceholder,
): string {
  return `${launch.issuer}:${launch.clientId}`;
}
