#!/usr/bin/env python3
"""
Cordova iOS Build Script
Builds Cordova iOS application and packages it as .ipa file
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from typing import Optional


class CordovaIOSBuilder:
    def __init__(self, project_path: str):
        self.project_path = Path(project_path).resolve()
        self.platforms_path = self.project_path / "platforms"
        self.ios_path = self.platforms_path / "ios"
        self.build_dir = self.project_path / "build"
        self.ipa_dir = self.build_dir / "ipa"

    def check_environment(self) -> dict:
        """Check if required tools are installed"""
        checks = {
            "xcode": self._check_xcode(),
            "cordova": self._check_cordova(),
            "ios_platform": self._check_ios_platform(),
            "node": self._check_node(),
        }
        return checks

    def _check_xcode(self) -> dict:
        """Check if Xcode is installed"""
        try:
            result = subprocess.run(
                ["xcodebuild", "-version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                version = result.stdout.strip()
                return {"installed": True, "version": version}
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        return {"installed": False, "version": None}

    def _check_cordova(self) -> dict:
        """Check if Cordova is installed"""
        try:
            result = subprocess.run(
                ["cordova", "-v"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                version = result.stdout.strip()
                return {"installed": True, "version": version}
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        return {"installed": False, "version": None}

    def _check_ios_platform(self) -> dict:
        """Check if iOS platform is added"""
        if not self.ios_path.exists():
            return {"installed": False, "version": None}

        # Try to get platform version from package.json or cordova-lib
        try:
            result = subprocess.run(
                ["cordova", "platform", "ls", "ios"],
                cwd=self.project_path,
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                return {"installed": True, "version": result.stdout.strip()}
        except Exception:
            pass

        return {"installed": True, "version": "unknown"}

    def _check_node(self) -> dict:
        """Check if Node.js is installed"""
        try:
            result = subprocess.run(
                ["node", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                version = result.stdout.strip()
                return {"installed": True, "version": version}
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        return {"installed": False, "version": None}

    def get_available_schemes(self) -> list:
        """Get available Xcode schemes"""
        if not self.ios_path.exists():
            return []

        try:
            result = subprocess.run(
                ["xcodebuild", "-list", "-project", "*.xcodeproj"],
                cwd=self.ios_path,
                capture_output=True,
                text=True,
                timeout=10,
                shell=True
            )

            if result.returncode == 0:
                schemes = []
                in_schemes = False
                for line in result.stdout.split('\n'):
                    line = line.strip()
                    if "Schemes:" in line:
                        in_schemes = True
                        continue
                    if in_schemes and line:
                        schemes.append(line)
                    elif in_schemes and not line:
                        break
                return schemes
        except Exception:
            pass

        return []

    def get_available_destinations(self) -> list:
        """Get available build destinations (simulators, devices)"""
        if not self.ios_path.exists():
            return []

        try:
            workspace = next(self.ios_path.glob("*.xcworkspace"))
            result = subprocess.run(
                ["xcodebuild", "-showdestinations", "-workspace", workspace.name],
                cwd=self.ios_path,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                destinations = []
                for line in result.stdout.split('\n'):
                    if "platform=" in line and "id=" in line:
                        # Parse destination info
                        dest = {}
                        for part in line.strip().split(', '):
                            if '=' in part:
                                key, val = part.split('=', 1)
                                dest[key] = val.strip('"')
                        if dest.get('platform') in ['iOS Simulator', 'iOS']:
                            destinations.append(dest)
                return destinations
        except Exception:
            pass

        return []

    def build_ios(self,
                  build_type: str = "debug",
                  scheme: Optional[str] = None,
                  destination: Optional[str] = None) -> dict:
        """
        Build iOS application

        Args:
            build_type: "debug" or "release"
            scheme: Xcode scheme name
            destination: Build destination ID

        Returns:
            dict with build results
        """
        # Ensure iOS platform exists
        if not self._check_ios_platform()["installed"]:
            return {"success": False, "error": "iOS platform not added"}

        workspace = next(self.ios_path.glob("*.xcworkspace"), None)
        if not workspace:
            return {"success": False, "error": "No .xcworkspace found"}

        # Default scheme
        if not scheme:
            schemes = self.get_available_schemes()
            scheme = schemes[0] if schemes else None

        if not scheme:
            return {"success": False, "error": "No scheme available"}

        # Build configuration
        config = "Debug" if build_type == "debug" else "Release"

        # Prepare xcodebuild command
        cmd = [
            "xcodebuild",
            "-workspace", workspace.name,
            "-scheme", scheme,
            "-configuration", config,
            "-derivedDataPath", str(self.build_dir / "DerivedData")
        ]

        if destination:
            cmd.extend(["-destination", destination])

        # Clean build option
        cmd.append("build")

        print(f"Building with: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd,
                cwd=self.ios_path,
                capture_output=True,
                text=True,
                timeout=600  # 10 minutes
            )

            if result.returncode == 0:
                return {
                    "success": True,
                    "build_type": build_type,
                    "scheme": scheme,
                    "workspace": str(workspace),
                    "stdout": result.stdout,
                }
            else:
                return {
                    "success": False,
                    "error": "Build failed",
                    "stderr": result.stderr,
                    "stdout": result.stdout,
                }
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Build timeout"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def package_ipa(self,
                    scheme: Optional[str] = None,
                    build_type: str = "debug") -> dict:
        """
        Package build as .ipa file

        Args:
            scheme: Xcode scheme name
            build_type: "debug" or "release"

        Returns:
            dict with package results including ipa path
        """
        # Build app
        build_result = self.build_ios(build_type=build_type, scheme=scheme)
        if not build_result["success"]:
            return build_result

        # Find .app file
        config = "Debug" if build_type == "debug" else "Release"
        derived_data = self.build_dir / "DerivedData" / scheme / "Build" / "Products" / config
        app_files = list(derived_data.glob("*.app"))

        if not app_files:
            return {"success": False, "error": "No .app file found"}

        app_path = app_files[0]

        # Create IPA directory
        self.ipa_dir.mkdir(parents=True, exist_ok=True)

        # Create .ipa (zip the .app file in Payload folder)
        ipa_name = f"{scheme}_{build_type}.ipa"
        ipa_path = self.ipa_dir / ipa_name

        try:
            import tempfile
            import shutil

            with tempfile.TemporaryDirectory() as temp_dir:
                payload_dir = Path(temp_dir) / "Payload"
                payload_dir.mkdir()

                # Copy .app to Payload
                shutil.copytree(app_path, payload_dir / app_path.name)

                # Create zip
                shutil.make_archive(str(ipa_path.with_suffix("")), "zip", temp_dir)

                # Rename to .ipa
                shutil.move(str(ipa_path.with_suffix(".zip")), ipa_path)

            return {
                "success": True,
                "ipa_path": str(ipa_path),
                "app_path": str(app_path),
                "size": ipa_path.stat().st_size,
                "size_mb": round(ipa_path.stat().st_size / 1024 / 1024, 2),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def clean_build(self) -> dict:
        """Clean build artifacts"""
        try:
            # Cordova clean
            subprocess.run(
                ["cordova", "clean", "ios"],
                cwd=self.project_path,
                capture_output=True,
                text=True,
                timeout=60
            )

            # Remove build directory
            if self.build_dir.exists():
                shutil.rmtree(self.build_dir)

            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 build_ios.py <project_path> [command]")
        print("Commands:")
        print("  check       - Check environment")
        print("  schemes     - List available schemes")
        print("  destinations - List available destinations")
        print("  build       - Build iOS app")
        print("  package     - Package as .ipa")
        print("  clean       - Clean build artifacts")
        sys.exit(1)

    project_path = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else "check"

    builder = CordovaIOSBuilder(project_path)

    if command == "check":
        result = builder.check_environment()
        print(json.dumps(result, indent=2))
    elif command == "schemes":
        schemes = builder.get_available_schemes()
        print(json.dumps(schemes, indent=2))
    elif command == "destinations":
        destinations = builder.get_available_destinations()
        print(json.dumps(destinations, indent=2))
    elif command == "build":
        result = builder.build_ios()
        print(json.dumps(result, indent=2))
    elif command == "package":
        result = builder.package_ipa()
        print(json.dumps(result, indent=2))
    elif command == "clean":
        result = builder.clean_build()
        print(json.dumps(result, indent=2))
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
