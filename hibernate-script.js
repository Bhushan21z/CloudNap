import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  EC2Client,
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand
} from "@aws-sdk/client-ec2";
import readlineSync from "readline-sync";

const REGION = process.env.AWS_DEFAULT_REGION || "ap-south-1";

async function assumeClientRole(roleArn) {
  const sts = new STSClient({ region: REGION });

  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: "hibernate-cli-session",
    DurationSeconds: 3600
  });

  const response = await sts.send(command);

  return {
    accessKeyId: response.Credentials.AccessKeyId,
    secretAccessKey: response.Credentials.SecretAccessKey,
    sessionToken: response.Credentials.SessionToken
  };
}

async function listInstances(credentials) {
  const ec2 = new EC2Client({
    region: REGION,
    credentials
  });

  const command = new DescribeInstancesCommand({});
  const response = await ec2.send(command);

  const instances = [];

  response.Reservations.forEach(res => {
    res.Instances.forEach(inst => {
      instances.push({
        id: inst.InstanceId,
        state: inst.State.Name,
        type: inst.InstanceType
      });
    });
  });

  return instances;
}

async function startStopInstance(credentials, instanceId, action) {
  const ec2 = new EC2Client({
    region: REGION,
    credentials
  });

  const command =
    action === "start"
      ? new StartInstancesCommand({ InstanceIds: [instanceId] })
      : new StopInstancesCommand({ InstanceIds: [instanceId] });

  await ec2.send(command);
}

(async () => {
  try {
    console.log("🔐 Hibernate CLI\n");

    const roleArn = readlineSync.question(
      "Enter client Role ARN: "
    );

    console.log("\n⏳ Assuming client role...");
    const tempCreds = await assumeClientRole(roleArn);
    console.log("✅ Role assumed successfully\n");

    console.log("📋 Fetching EC2 instances...\n");
    const instances = await listInstances(tempCreds);

    if (instances.length === 0) {
      console.log("No EC2 instances found.");
      process.exit(0);
    }

    instances.forEach((i, idx) => {
      console.log(
        `${idx + 1}. ${i.id} | ${i.state} | ${i.type}`
      );
    });

    const index = readlineSync.questionInt(
      "\nSelect instance number: "
    );

    const instance = instances[index - 1];
    if (!instance) {
      console.log("❌ Invalid selection");
      process.exit(1);
    }

    const action = readlineSync.question(
      "Type 'start' or 'stop': "
    );

    if (!["start", "stop"].includes(action)) {
      console.log("❌ Invalid action");
      process.exit(1);
    }

    console.log(`\n🚀 Executing ${action} on ${instance.id}...`);
    await startStopInstance(tempCreds, instance.id, action);

    console.log("✅ Done!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();
