aws-vault exec wassha-eaas-dev -- aws ecr get-login-password --region af-south-1 | docker login --username AWS --password-stdin 067333984569.dkr.ecr.af-south-1.amazonaws.com
aws-vault exec wassha-eaas-dev -- bazelisk run //:push_image --platforms=//:linux_arm64
aws-vault exec wassha-eaas-dev -- bazelisk run //manifests:deploy
