plugins {
    kotlin("multiplatform")
    id("com.squareup.sqldelight")
    kotlin("plugin.serialization") version "1.9.10"
}

kotlin {
    androidTarget()
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:1.6.0")
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.4.1")
                implementation("com.squareup.sqldelight:runtime:2.0.0")
            }
        }
        val androidMain by getting {
            dependencies {
                implementation("com.squareup.sqldelight:android-driver:2.0.0")
            }
        }
        val iosMain by getting {
            dependencies {
                implementation("com.squareup.sqldelight:native-driver:2.0.0")
            }
        }
    }
}

sqldelight {
    database("ExpenseDatabase") {
        packageName = "com.example.expensetracker"
        sourceFolders = listOf("sqldelight")
    }
}
