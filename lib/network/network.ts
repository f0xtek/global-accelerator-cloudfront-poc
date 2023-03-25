import { Vpc } from "aws-cdk-lib/aws-ec2";
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
      enableDnsHostnames: true,
      enableDnsSupport: true,
      vpcName: props.name,
    });
  }
}
