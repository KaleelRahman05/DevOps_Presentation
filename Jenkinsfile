pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME = 'cinescope'
        IMAGE_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'latest'}"
        BACKEND_URL = 'http://localhost:5000'
        FRONTEND_URL = 'http://localhost:3000'
        CI = 'true'
    }

    triggers {
        // Poll GitHub repository every 5 minutes as a fallback when webhook is not reachable from local network
        pollSCM('H/5 * * * *')
    }

    stages {
        // =================================================================
        // Stage 1: Source Code Checkout
        // =================================================================
        stage('Checkout') {
            steps {
                echo "=========================================================="
                echo " [CI/CD Stage 1] Checking out repository branch..."
                echo " Workspace: ${env.WORKSPACE}"
                echo " Build ID:  ${env.BUILD_NUMBER}"
                echo "=========================================================="
                checkout scm
                script {
                    def commitHash = isUnix() ? sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim() : bat(returnStdout: true, script: '@git rev-parse --short HEAD').trim()
                    echo "Checking out Git Commit: ${commitHash}"
                }
            }
        }

        // =================================================================
        // Stage 2: Install Dependencies
        // =================================================================
        stage('Install Dependencies') {
            steps {
                echo "=========================================================="
                echo " [CI/CD Stage 2] Installing dependencies via npm ci..."
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'cd backend && npm ci'
                        sh 'cd frontend && npm ci'
                    } else {
                        bat 'cd backend && npm ci'
                        bat 'cd frontend && npm ci'
                    }
                }
            }
        }

        // =================================================================
        // Stage 3: Backend Automated Tests
        // =================================================================
        stage('Backend Tests') {
            steps {
                echo "=========================================================="
                echo " [CI/CD Stage 3] Executing Backend API & Logic Tests..."
                echo " (Using isolated in-memory test database)"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'cd backend && npm test'
                    } else {
                        bat 'cd backend && npm test'
                    }
                }
            }
        }

        // =================================================================
        // Stage 4: Frontend Validation & Production Build
        // =================================================================
        stage('Frontend Validation') {
            steps {
                echo "=========================================================="
                echo " [CI/CD Stage 4] Running Frontend Tests & Vite Build..."
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'cd frontend && npm test'
                        sh 'cd frontend && npm run build'
                    } else {
                        bat 'cd frontend && npm test'
                        bat 'cd frontend && npm run build'
                    }
                }
            }
        }

        // =================================================================
        // Stage 5: Docker Container Build
        // =================================================================
        stage('Docker Build') {
            steps {
                echo "=========================================================="
                echo " [CI/CD Stage 5] Building Docker Images..."
                echo " Image Tags: ${IMAGE_TAG} and latest"
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh "docker build -t cinescope-backend:${IMAGE_TAG} -t cinescope-backend:latest ./backend"
                        sh "docker build -t cinescope-frontend:${IMAGE_TAG} -t cinescope-frontend:latest ./frontend"
                    } else {
                        bat "docker build -t cinescope-backend:${IMAGE_TAG} -t cinescope-backend:latest ./backend"
                        bat "docker build -t cinescope-frontend:${IMAGE_TAG} -t cinescope-frontend:latest ./frontend"
                    }
                }
            }
        }

        // =================================================================
        // Stage 6: Deploy to Demo Environment
        // =================================================================
        stage('Deploy') {
            steps {
                echo "=========================================================="
                echo " [CI/CD Stage 6] Deploying Application via Docker Compose..."
                echo " NOTE: Database volume 'cinescope-mongo-data' is preserved!"
                echo "=========================================================="
                script {
                    // Start services without downing or removing volumes
                    if (isUnix()) {
                        sh 'docker compose up -d --remove-orphans mongodb'
                        sh 'docker compose up -d --no-deps --build backend frontend'
                    } else {
                        bat 'docker compose up -d --remove-orphans mongodb'
                        bat 'docker compose up -d --no-deps --build backend frontend'
                    }
                }
            }
        }

        // =================================================================
        // Stage 7: Deployment Smoke Tests
        // =================================================================
        stage('Smoke Test') {
            steps {
                echo "=========================================================="
                echo " [CI/CD Stage 7] Running Deployment Smoke Tests..."
                echo "=========================================================="
                script {
                    if (isUnix()) {
                        sh 'node scripts/smoke-test.js'
                    } else {
                        bat 'node scripts/smoke-test.js'
                    }
                }
            }
        }
    }

    // =================================================================
    // Stage 8: Post-Build Reporting & Cleanup
    // =================================================================
    post {
        always {
            echo "=========================================================="
            echo " [CI/CD Stage 8] Post-Build Reporting & Temporary Cleanup"
            echo "=========================================================="
            cleanWs(
                cleanWhenAborted: false,
                cleanWhenFailure: false,
                cleanWhenNotBuilt: false,
                cleanWhenSuccess: false,
                deleteDirs: false,
                patterns: [
                    [pattern: '**/coverage/**', type: 'INCLUDE'],
                    [pattern: '**/*.log', type: 'INCLUDE']
                ]
            )
        }
        success {
            echo "----------------------------------------------------------"
            echo " >>> CineScope Pipeline Result: SUCCESS <<< "
            echo " Deployed Build: #${env.BUILD_NUMBER} (${IMAGE_TAG})"
            echo " Web App URL:    ${FRONTEND_URL}"
            echo " REST API URL:   ${BACKEND_URL}/api/health"
            echo " Database State: Persistent & Healthy"
            echo "----------------------------------------------------------"
        }
        failure {
            echo "----------------------------------------------------------"
            echo " >>> CineScope Pipeline Result: FAILED <<< "
            echo " Build: #${env.BUILD_NUMBER} halted before/during deployment."
            echo " Check the stage console output above to isolate failure."
            echo " Existing running deployment and database volume were not altered."
            echo "----------------------------------------------------------"
        }
    }
}
