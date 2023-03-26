import { RemovalPolicy } from "aws-cdk-lib";
import {
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  SecurityGroup,
  SubnetType,
  UserData,
} from "aws-cdk-lib/aws-ec2";
import {
  CfnInstanceProfile,
  ManagedPolicy,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
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
  securityGroup: SecurityGroup;
}

export class NginxInstance extends Construct {
  instance: Instance;
  instanceProfile: CfnInstanceProfile;

  constructor(scope: Construct, id: string, props: NginxInstaceProps) {
    super(scope, id);

    const roleName = `nginxInstance-${props.namePrefix}`;

    const policy = ManagedPolicy.fromManagedPolicyArn(
      this,
      "SSM",
      "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
    );

    const role: Role = new Role(this, `nginxInstance-${props.namePrefix}`, {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [policy],
      roleName,
    });
    role.applyRemovalPolicy(RemovalPolicy.DESTROY);

    this.instanceProfile = new CfnInstanceProfile(this, "SSMInstanceProfile", {
      instanceProfileName: roleName,
      roles: [role.roleName],
    });
    this.instanceProfile.applyRemovalPolicy(RemovalPolicy.DESTROY);

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
      role,
      userData,
      requireImdsv2: true,
      userDataCausesReplacement: true,
      securityGroup: props.securityGroup,
    });
    this.instance.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }

  get publicDnsName() {
    return this.instance.instancePublicDnsName;
  }

  get publicIp() {
    return this.instance.instancePublicIp;
  }
}
