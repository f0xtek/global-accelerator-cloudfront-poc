import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import { NginxDistribution } from "./cloudfront/distribution";
import { NginxInstance } from "./ec2/nginx";
import { NginxInstanceGlobalAccelerator } from "./global-accelerator/nginx";
import { Network } from "./network/network";
import { authorizeIngressRuleFromPublicIp } from "./network/utils";

export class GlobalAcceleratorCloudfrontStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const network = new Network(this, "globalAcceleratorNetwork", {
      name: "gloalAcceleratorCloudFrontTest",
      azs: this.availabilityZones,
    });

    const securityGroup: SecurityGroup = new SecurityGroup(
      this,
      "nginxInstanceSG",
      {
        vpc: network.vpc,
        allowAllOutbound: true,
        securityGroupName: "nginxInstances",
      }
    );

    securityGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);
    authorizeIngressRuleFromPublicIp(securityGroup, 80);

    const globalAcceleratorInstance: NginxInstance = new NginxInstance(
      this,
      "globalAcceleratorInstance",
      {
        namePrefix: "globalAccelerator",
        network,
        securityGroup,
      }
    );

    const cloudFrontInstance: NginxInstance = new NginxInstance(
      this,
      "cloudFrontInstance",
      {
        namePrefix: "cloudfront",
        network,
        securityGroup,
      }
    );

    const standardInstance: NginxInstance = new NginxInstance(
      this,
      "standardInstance",
      {
        namePrefix: "standard",
        network,
        securityGroup,
      }
    );

    const accelerator: NginxInstanceGlobalAccelerator =
      new NginxInstanceGlobalAccelerator(this, "nginxGlobalAccelerator", {
        nginxInstanceTargets: [globalAcceleratorInstance],
      });

    const cloudFrontDistro: NginxDistribution = new NginxDistribution(
      this,
      "nginxDistro",
      {
        origin: cloudFrontInstance.publicDnsName,
      }
    );

    new CfnOutput(this, "acceleratorDns", {
      exportName: "GlobalAcceleratorDNS",
      value: accelerator.dnsName,
      description: "The DNS address of the Global Accelerator endpoint.",
    });

    new CfnOutput(this, "cloudFrontDomainName", {
      exportName: "CloudFrontDomainName",
      value: cloudFrontDistro.domainName,
      description: "The domain name for the CloudFront Distribution",
    });

    new CfnOutput(this, "standardNginxInstanceDNSName", {
      exportName: "StandardNginxDNSName",
      value: standardInstance.publicDnsName,
      description: "The public DNS name for the standard Nginx instance.",
    });
  }
}
