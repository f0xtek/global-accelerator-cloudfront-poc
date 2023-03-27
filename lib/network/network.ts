import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface NetworkProps {
  name: string;
  azs: string[];
}

export class Network extends Construct {
  vpc: Vpc;

  constructor(scope: Construct, id: string, props: NetworkProps) {
    super(scope, id);
    this.vpc = new Vpc(scope, "vpc", {
      availabilityZones: props.azs,
      subnetConfiguration: [
        {
          cidrMask: 24,
          subnetType: SubnetType.PUBLIC,
          name: "public",
        },
        {
          cidrMask: 24,
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          name: "private",
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
      vpcName: props.name,
    });
  }
}
