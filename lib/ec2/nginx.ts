import {
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  SubnetType,
  UserData,
} from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { Network } from "../network/network";

const userData: UserData = UserData.forLinux();
userData.addCommands(
  "set -euo pipefail",
  "yum update",
  "amazon-linux-extras install -y nginx1",
  "systemctl enable --now nginx"
);

export interface NginxInstaceProps {
  namePrefix: string;
  network: Network;
}

export class NginxInstance extends Construct {
  instance: Instance;

  constructor(scope: Construct, id: string, props: NginxInstaceProps) {
    super(scope, id);

    this.instance = new Instance(scope, `nginxInstance-${props.namePrefix}`, {
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
      machineImage: new AmazonLinuxImage({
        generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      vpc: props.network.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      instanceName: `${props.namePrefix}-nginx`,
      userData: userData,
      requireImdsv2: true,
      userDataCausesReplacement: true,
    });
  }

  get publicDnsName() {
    return this.instance.instancePublicDnsName;
  }

  get publicIp() {
    return this.instance.instancePublicIp;
  }
}
