# android-flutter-engine-debugger  

[切换到中文README](README_ZH.md)

 
A VSCode plugin for debugging Flutter Engine Android Application


## Features

1. Get flutter source code && compile Flutter Engine s

    Get the engine code 
    [Setting-up-the-Engine-development-environment](https://github.com/flutter/flutter/wiki/Setting-up-the-Engine-development-environment)

    Compile Engine:[compiling-for-android-from-macos-or-linux](https://github.com/flutter/flutter/wiki/Compiling-the-engine#compiling-for-android-from-macos-or-linux)


    For example, use the command ： `./flutter/tools/gn --android  --debug --unoptimized` 
    Finally, you will get the aritfact in the directory `out/android_debug_unopt_arm64 `


2. Launch Android Flutter Application using a local parameter

    [Setting-up-the-Engine-development-environment](https://github.com/flutter/flutter/wiki/Debugging-the-engine)

    ```fluter run --local-engine=android_debug_unopt_arm64 --local-engine-src-path={YourflutterEngineSrcPath}```

3. Open the src/flutter directory in VSCode.

    Important! Please ensure that the Android application running in the foreground as step 2 .

    and open `src/flutter direcotry `!!!!! not `src`

    open extension and fill the parameter.

    · local-engine-src-path: The src directory of the Flutter source code.(Same as the --local-engine-src-path parameter in step 2.)

    · local engine: The output directory of the engine, located in the out directory. (It varies depending on the compilation parameters, such as `android_debug_unopt_arm64`.)

    · lpackage name: The package name of the Android application.

    After clicking start, if everything is normal, the last prompt `You can use press F5 to debug!!` means success.

3. Everything is ready, press F5 to start debugging



## Requirements

· Obtain Flutter Engine source code.

· Compile Flutter source code.

· Run Android application using a local engine.


## Issues

1. ANDROID_HOME is empty. Please set the ANDROID_HOME environment variable
    
   Please successfully set the ANDROID_HOME environment variable in the configuration environment such as .zshrc or .bash_profile. If you confirm that the settings are successful but still report an error, this may be caused by the nodejs environment, you can try to restart vscode


**Enjoy!**
