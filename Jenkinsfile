pipeline {
    agent any

    environment {
        IMAGE_NAME       = "forkful-app"
        DOCKERHUB_USER   = credentials('dockerhub-username')   // Jenkins credential (secret text)
        DOCKERHUB_CREDS  = credentials('dockerhub-credentials') // Jenkins credential (username+password)
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
        KUBE_NAMESPACE   = "default"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Lint / Basic Checks') {
            steps {
                sh '''
                    echo "Checking required files exist..."
                    test -f index.html
                    test -f menu.html
                    test -f cart.html
                    test -f billing.html
                    test -f Dockerfile
                    echo "OK"
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} ${DOCKERHUB_USER}/${IMAGE_NAME}:latest
                """
            }
        }

        stage('Push Docker Image') {
            steps {
                sh """
                    echo "${DOCKERHUB_CREDS_PSW}" | docker login -u "${DOCKERHUB_CREDS_USR}" --password-stdin
                    docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                    docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    sed -i "s#<YOUR_DOCKERHUB_USERNAME>/${IMAGE_NAME}:latest#${DOCKERHUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}#g" k8s/deployment.yaml
                    kubectl apply -f k8s/deployment.yaml -n ${KUBE_NAMESPACE}
                    kubectl apply -f k8s/service.yaml -n ${KUBE_NAMESPACE}
                    kubectl apply -f k8s/ingress.yaml -n ${KUBE_NAMESPACE}
                    kubectl rollout status deployment/forkful-app -n ${KUBE_NAMESPACE} --timeout=120s
                """
            }
        }
    }

    post {
        success {
            echo "✅ Forkful app deployed successfully: build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline failed — check logs above."
        }
        always {
            sh 'docker logout || true'
        }
    }
}
