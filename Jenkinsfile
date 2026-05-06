pipeline {
    agent any

    environment {
        // SonarQube
        SONAR_PROJECT_KEY = "crm-backend-gateway"

        // AWS ECR
        AWS_REGION        = "ap-south-1"
        AWS_ACCOUNT_ID    = "<YOUR_AWS_ACCOUNT_ID>"
        ECR_REPO_NAME     = "crm-backend-gateway"
        IMAGE_TAG         = "${BUILD_NUMBER}"

        ECR_REGISTRY      = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        FULL_IMAGE        = "${ECR_REGISTRY}/${ECR_REPO_NAME}:${IMAGE_TAG}"
        LATEST_IMAGE      = "${ECR_REGISTRY}/${ECR_REPO_NAME}:latest"
    }

    stages {

        // ──────────────────────────────────────
        // STAGE 1: Checkout
        // ──────────────────────────────────────
        stage('1. Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/<your-org>/crm-backend-gateway.git',
                    credentialsId: 'github-creds'
                echo "✅ Source code checked out"
            }
        }

        // ──────────────────────────────────────
        // STAGE 2: SonarQube Analysis
        // ──────────────────────────────────────
        stage('2. SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.projectName=${SONAR_PROJECT_KEY} \
                          -Dsonar.sources=. \
                          -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.git/**
                    """
                }
                echo "✅ SonarQube analysis completed"
            }
        }

        // ──────────────────────────────────────
        // STAGE 3: Quality Gate
        // ──────────────────────────────────────
        stage('3. Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
                echo "✅ Quality Gate passed"
            }
        }

        // ──────────────────────────────────────
        // STAGE 4: Image Build
        // ──────────────────────────────────────
        stage('4. Image Build') {
            steps {
                sh "docker build -t ${ECR_REPO_NAME}:${IMAGE_TAG} ."
                echo "✅ Docker image built: ${ECR_REPO_NAME}:${IMAGE_TAG}"
            }
        }

        // ──────────────────────────────────────
        // STAGE 5: Tag Image
        // ──────────────────────────────────────
        stage('5. Tag Image') {
            steps {
                sh """
                    docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} ${FULL_IMAGE}
                    docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} ${LATEST_IMAGE}
                """
                echo "✅ Tagged → ${FULL_IMAGE}"
                echo "✅ Tagged → ${LATEST_IMAGE}"
            }
        }

        // ──────────────────────────────────────
        // STAGE 6: Push Image to ECR
        // ──────────────────────────────────────
        stage('6. Push Image to ECR') {
            steps {
                withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                  credentialsId: 'aws-ecr-creds']]) {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} \
                          | docker login --username AWS --password-stdin ${ECR_REGISTRY}

                        docker push ${FULL_IMAGE}
                        docker push ${LATEST_IMAGE}
                    """
                }
                echo "✅ Image pushed to ECR"
            }
        }

        // ──────────────────────────────────────
        // STAGE 7: Cleanup Images from Jenkins Server
        // ──────────────────────────────────────
        stage('7. Cleanup Images from Jenkins Server') {
            steps {
                sh """
                    docker rmi ${ECR_REPO_NAME}:${IMAGE_TAG} || true
                    docker rmi ${FULL_IMAGE}                  || true
                    docker rmi ${LATEST_IMAGE}                || true
                """
                echo "✅ Local Docker images cleaned up"
            }
        }
    }

    post {
        success {
            echo "✅ PIPELINE SUCCESS — ${FULL_IMAGE} pushed to ECR"
        }
        failure {
            echo "❌ PIPELINE FAILED — Check stage logs above"
        }
    }
}
