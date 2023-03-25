import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginRequestPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";

export interface NginxDistributionProps {
  origin: string;
}

export class NginxDistribution extends Construct {
  distribution: Distribution;

  constructor(scope: Construct, id: string, props: NginxDistributionProps) {
    super(scope, id);

    this.distribution = new Distribution(scope, "distro", {
      enabled: true,
      defaultBehavior: {
        origin: new origins.HttpOrigin(props.origin),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        compress: false,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
      },
    });
  }

  get domainName() {
    return this.distribution.domainName;
  }
}
