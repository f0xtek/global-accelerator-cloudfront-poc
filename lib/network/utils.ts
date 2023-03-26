import { Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import axios from "axios";

async function getPublicIp(
  url: string = "https://checkip.amazonaws.com"
): Promise<string> {
  let ip: string;
  try {
    const resp = await axios.get<string>(url);
    ip = resp.data.trim().concat("/32");
    return ip;
  } catch (error) {
    throw new Error(`Error in 'getPublicIpFromAmazon' for ${url}: ${error}`);
  }
}

export async function authorizeIngressRuleFromPublicIp(
  securityGroup: SecurityGroup,
  port: number
) {
  try {
    const ip = await getPublicIp();
    securityGroup.addIngressRule(Peer.ipv4(ip), Port.tcp(port));
  } catch (error) {
    console.error(error);
    console.log("Defaulting ingress rule to 0.0.0.0/0");
    securityGroup.addIngressRule(Peer.ipv4("0.0.0.0/0"), Port.tcp(port));
  }
}
