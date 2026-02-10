import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
    EC2Client,
    DescribeInstancesCommand,
    StartInstancesCommand,
    StopInstancesCommand
} from "@aws-sdk/client-ec2";

export async function assumeClientRole(roleArn, region = "ap-south-1") {
    const sts = new STSClient({ region });

    const command = new AssumeRoleCommand({
        RoleArn: roleArn,
        RoleSessionName: "hibernate-saas-session",
        DurationSeconds: 3600
    });

    const response = await sts.send(command);

    return {
        accessKeyId: response.Credentials.AccessKeyId,
        secretAccessKey: response.Credentials.SecretAccessKey,
        sessionToken: response.Credentials.SessionToken
    };
}

export async function listInstances(credentials, region = "ap-south-1") {
    const ec2 = new EC2Client({
        region,
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
                type: inst.InstanceType,
                name: inst.Tags?.find(t => t.Key === "Name")?.Value || inst.InstanceId
            });
        });
    });

    return instances;
}

export async function startStopInstance(credentials, instanceId, action, region = "ap-south-1") {
    const ec2 = new EC2Client({
        region,
        credentials
    });

    const command =
        action === "start"
            ? new StartInstancesCommand({ InstanceIds: [instanceId] })
            : new StopInstancesCommand({ InstanceIds: [instanceId] });

    await ec2.send(command);
    return { success: true };
}
