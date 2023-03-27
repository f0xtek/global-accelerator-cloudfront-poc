import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as GlobalAcceleratorCloudfront from "../lib/global-accelerator-cloudfront-stack";

const app = new cdk.App();
const stack = new GlobalAcceleratorCloudfront.GlobalAcceleratorCloudfrontStack(
  app,
  "MyTestStack"
);
const template = Template.fromStack(stack);

test("VPC Created", () => {
  // const app = new cdk.App();
  // WHEN
  // const stack =
  //   new GlobalAcceleratorCloudfront.GlobalAcceleratorCloudfrontStack(
  //     app,
  //     "MyTestStack"
  //   );
  // THEN
  // const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::EC2::VPC", {
    EnableDnsHostnames: true,
    EnableDnsSupport: true,
    CidrBlock: "10.0.0.0/16",
  });
});

test("All Subnets Created", () => {
  // const app = new cdk.App();
  // WHEN
  // const stack =
  //   new GlobalAcceleratorCloudfront.GlobalAcceleratorCloudfrontStack(
  //     app,
  //     "MyTestStack"
  //   );
  // THEN
  // const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::EC2::Subnet", 4);
});
