#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { GlobalAcceleratorCloudfrontStack } from "../lib/global-accelerator-cloudfront-stack";

const app = new cdk.App();

const devStack = new GlobalAcceleratorCloudfrontStack(
  app,
  "DevGlobalAcceleratorCloudfrontStack",
  {
    env: { account: "355205175701", region: "eu-west-2" },
  }
);
