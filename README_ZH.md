# android-flutter-engine-debugger

[English README](README.md)

Android调试Flutter Engine的 VSCode插件

## Features

1. 根据官方拉取flutter engine的源码 && 编译Flutter engine

    拉取引擎代码： 
    [Setting-up-the-Engine-development-environment](https://github.com/flutter/flutter/wiki/Setting-up-the-Engine-development-environment)

    编译引擎：[compiling-for-android-from-macos-or-linux](https://github.com/flutter/flutter/wiki/Compiling-the-engine#compiling-for-android-from-macos-or-linux)


    比如使用命令 ： `./flutter/tools/gn --android  --debug --unoptimized` 
    最后将得到 `out/android_debug_unopt_arm64 `


2. 使用local engine启动flutter工程

    [Setting-up-the-Engine-development-environment](https://github.com/flutter/flutter/wiki/Debugging-the-engine)

    ```fluter run --local-engine=android_debug_unopt_arm64 --local-engine-src-path={YourflutterEngineSrcPath}```

3. 使用VSCode打开src/flutter源码目录

    重要！重要！：请保持2步骤运行的Android进程在前台
    
    · local-engine-src-path:  flutter源码的中src目录，同步骤2中的 --local-engine-src-path 参数

    · local engine:  out目录里面的，引擎输出目录，根据编译参数的不同而不同，比如android_debug_unopt_arm64

    · package name : Android应用的packagename

## Requirements

1. 获取flutter engine源码
2. 编译flutter源码
3. 使用local engine方式运行Android应用

**Enjoy!**
