Create an EKS Cluster

```
eksctl create cluster \
  --name food-app \
  --region us-east-1 \
  --without-nodegroup
```

Create a Managed Node Group

```
eksctl create nodegroup \
--cluster=food-app \
--region=us-east-1 \
--name=worker-nodes \
--node-type=c7i-flex.large \
--nodes=2 \
--nodes-min=2 \
--nodes-max=2 \
--managed \
--ssh-access \
--ssh-public-key=myaws26
```

Associate the IAM OIDC Provider
```
eksctl utils associate-iam-oidc-provider \
  --cluster food-app \
  --region us-east-1 \
  --approve
```

Download the AWS Load Balancer IAM Policy
```
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
```

Create the IAM policy:

```
aws iam create-policy \
  --policy-name AWSLoadBalancerControllerIAMPolicy \
  --policy-document file://iam_policy.json
```
Create the IAM Service Account (IRSA) 
```
eksctl create iamserviceaccount \
  --cluster food-app\
  --namespace kube-system \
  --name aws-load-balancer-controller \
  --attach-policy-arn arn:aws:iam::746244690537:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --approve \
  --region us-east-1
```

Install Helm 

```
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

```

Add the EKS Helm Repository

```
helm repo add eks https://aws.github.io/eks-charts
```

Install the AWS Load Balancer Controller 
```
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=food-app \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set region=us-east-1 \
  --set vpcId=vpc-0cd9f7871adbf6915
```

Verify the Controller
```
kubectl logs deployment/aws-load-balancer-controller -n kube-system
```
