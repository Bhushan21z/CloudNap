#!/usr/bin/env bash
set -euo pipefail

############################################
# CONFIG – CHANGE ONLY THESE IF NEEDED
############################################

# Your (Hibernate) AWS account details
HIBERNATE_ACCOUNT_ID="711387126175"
HIBERNATE_USER_NAME="hibernate-user"

# Client-side resources
POLICY_NAME="hibernateMinimumPolicy"
ROLE_NAME="hibernate-client"

############################################
# UTILS
############################################

log() {
  echo -e "\n🔹 $1"
}

############################################
# PRE-CHECKS
############################################

command -v aws >/dev/null 2>&1 || {
  echo "❌ AWS CLI not installed"
  exit 1
}

aws sts get-caller-identity >/dev/null || {
  echo "❌ AWS CLI not configured (run aws configure)"
  exit 1
}

############################################
# CREATE OR FETCH POLICY
############################################

log "Checking IAM policy..."

POLICY_ARN=$(aws iam list-policies \
  --scope Local \
  --query "Policies[?PolicyName=='$POLICY_NAME'].Arn | [0]" \
  --output text)

if [[ -z "$POLICY_ARN" || "$POLICY_ARN" == "None" ]]; then
  log "Creating IAM policy..."
  POLICY_ARN=$(aws iam create-policy \
    --policy-name "$POLICY_NAME" \
    --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["ec2:DescribeInstances","ec2:StartInstances","ec2:StopInstances"],"Resource":"*"}]}' \
    --query "Policy.Arn" \
    --output text)
fi

echo "✅ Policy ARN: $POLICY_ARN"

############################################
# CREATE OR FETCH ROLE
############################################

log "Checking IAM role..."

ROLE_ARN=$(aws iam get-role \
  --role-name "$ROLE_NAME" \
  --query "Role.Arn" \
  --output text 2>/dev/null || true)

if [[ -z "$ROLE_ARN" || "$ROLE_ARN" == "None" ]]; then
  log "Creating IAM role..."
  ROLE_ARN=$(aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document "{
      \"Version\": \"2012-10-17\",
      \"Statement\": [
        {
          \"Effect\": \"Allow\",
          \"Principal\": {
            \"AWS\": \"arn:aws:iam::$HIBERNATE_ACCOUNT_ID:user/$HIBERNATE_USER_NAME\"
          },
          \"Action\": \"sts:AssumeRole\"
        }
      ]
    }" \
    --query "Role.Arn" \
    --output text)
fi

echo "✅ Role ARN: $ROLE_ARN"

############################################
# ATTACH POLICY TO ROLE
############################################

log "Attaching policy to role..."

aws iam attach-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-arn "$POLICY_ARN"

############################################
# DONE
############################################

echo ""
echo "🎉 HIBERNATE SETUP COMPLETE"
echo "--------------------------------------------"
echo "👉 Paste this Role ARN into Hibernate UI:"
echo ""
echo "$ROLE_ARN"
echo "--------------------------------------------"
