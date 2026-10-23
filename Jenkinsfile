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

        stage('Deploy') {
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
            echo 'CineScope CI/CD succeeded. App: http://localhost:3000'
        }
        failure {
            echo 'CineScope CI/CD failed. Review the stage logs; the previous app remains available.'
        }
    }
}
