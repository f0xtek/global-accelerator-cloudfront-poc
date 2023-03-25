import { Accelerator, Listener } from "aws-cdk-lib/aws-globalaccelerator";
import { InstanceEndpoint } from "aws-cdk-lib/aws-globalaccelerator-endpoints";
import { Construct } from "constructs";
import { NginxInstance } from "../ec2/nginx";

export interface NginxInstanceGlobalAcceleratorProps {
  nginxInstanceTargets: NginxInstance[];
}

export class NginxInstanceGlobalAccelerator extends Construct {
  accelerator: Accelerator;
  listener: Listener;

  constructor(
    scope: Construct,
    id: string,
    props: NginxInstanceGlobalAcceleratorProps
  ) {
    super(scope, id);

    this.accelerator = new Accelerator(scope, "accelerator", {
      enabled: true,
      acceleratorName: "nginxGlobalAccelerator",
    });

    this.listener = this.accelerator.addListener("Listener", {
      portRanges: [{ fromPort: 80 }],
    });

    this.listener.addEndpointGroup("globalAcceleratorInstances", {
      endpoints: props.nginxInstanceTargets.map(
        (target) =>
          new InstanceEndpoint(target.instance, {
            preserveClientIp: true,
          })
      ),
    });
  }

  get dnsName() {
    return this.accelerator.dnsName;
  }
}
