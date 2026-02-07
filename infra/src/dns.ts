import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { PersonaConfig, awsConfig } from "./config";

export function createDnsRecord(
  persona: PersonaConfig,
  publicIp: pulumi.Output<string>
) {
  return new aws.route53.Record(`openclaw-${persona.name}-dns`, {
    zoneId: awsConfig.hostedZoneId,
    name: persona.subdomain,
    type: "A",
    ttl: 300,
    records: [publicIp],
  });
}
