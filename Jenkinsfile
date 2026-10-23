pipeline {
    agent any

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm --prefix frontend ci'
                    } else {
                        bat 'npm --prefix frontend ci'
                    }
                }
            }
        }

        stage('Test') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm --prefix frontend test'
                    } else {
                        bat 'npm --prefix frontend test'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm --prefix frontend run build'
                    } else {
                        bat 'npm --prefix frontend run build'
                    }
                }
            }
        }

        stage('Check Docker') {
            steps {
                script {
                    def dockerStatus
                    if (isUnix()) {
                        dockerStatus = sh(returnStatus: true, script: 'docker info >/dev/null 2>&1')
                    } else {
                        dockerStatus = bat(returnStatus: true, script: '@docker info >NUL 2>&1')
                    }

                    env.DOCKER_AVAILABLE = dockerStatus == 0 ? 'true' : 'false'
                    if (env.DOCKER_AVAILABLE == 'true') {
                        echo 'Docker is available. Deployment and smoke test will run.'
                    } else {
                        echo 'Docker is unavailable. Deployment and smoke test will be skipped; CI validation will still complete.'
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                expression { env.DOCKER_AVAILABLE == 'true' }
            }
            steps {
                script {
                    if (isUnix()) {
                        sh 'docker compose up -d --build frontend'
                    } else {
                        bat 'docker compose up -d --build frontend'
                    }
                }
            }
        }

        stage('Smoke Test') {
            when {
                expression { env.DOCKER_AVAILABLE == 'true' }
            }
            steps {
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

    post {
        success {
            script {
                if (env.DOCKER_AVAILABLE == 'true') {
                    echo 'CineScope CI/CD succeeded. App: http://localhost:3000'
                } else {
                    echo 'CineScope CI validation succeeded (tests and build). Deployment and smoke test were skipped because Docker is unavailable.'
                }
            }
        }
        failure {
            echo 'CineScope CI/CD failed. Review the stage logs; the previous app remains available.'
        }
    }
}
