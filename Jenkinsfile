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

    parameters {
        booleanParam(
            name: 'DEMO_TEST_FAILURE',
            defaultValue: true,
            description: 'Run a deliberate failing test to demonstrate Jenkins failure handling.'
        )
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
                withEnv(["CINESCOPE_DEMO_TEST_FAILURE=${params.DEMO_TEST_FAILURE}"]) {
                    script {
                        if (isUnix()) {
                            sh 'npm --prefix frontend test'
                        } else {
                            bat 'npm --prefix frontend test'
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN'),
                    string(credentialsId: 'vercel-org-id', variable: 'VERCEL_ORG_ID'),
                    string(credentialsId: 'vercel-project-id', variable: 'VERCEL_PROJECT_ID')
                ]) {
                    if (isUnix()) {
                        sh 'npm --prefix frontend run vercel:pull'
                        sh 'npm --prefix frontend run vercel:build'
                    } else {
                        bat 'npm --prefix frontend run vercel:pull'
                        bat 'npm --prefix frontend run vercel:build'
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN'),
                    string(credentialsId: 'vercel-org-id', variable: 'VERCEL_ORG_ID'),
                    string(credentialsId: 'vercel-project-id', variable: 'VERCEL_PROJECT_ID')
                ]) {
                    if (isUnix()) {
                        sh 'npm --prefix frontend run deploy'
                    } else {
                        bat 'npm --prefix frontend run deploy'
                    }
                }
            }
        }

        stage('Smoke Test') {
            steps {
                withCredentials([
                    string(credentialsId: 'vercel-site-url', variable: 'FRONTEND_URL')
                ]) {
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
            echo 'CineScope CI/CD succeeded. The production site was deployed and smoke-tested.'
        }
        failure {
            echo "CineScope CI/CD failed. Check the failed stage in Jenkins: ${env.BUILD_URL}console"
            echo 'The previous production app remains available.'
        }
    }
}
