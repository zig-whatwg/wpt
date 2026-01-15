# mypy: allow-untyped-defs
"""
Crane Browser - WebDriver product for wptrunner

Crane is a Zig-based browser that implements WebDriver protocol directly.
The crane executable functions as both browser and WebDriver server.
"""

from .base import (WebDriverBrowser,  # noqa: F401
                   get_timeout_multiplier)  # noqa: F401
from ..executors import executor_kwargs as base_executor_kwargs
from ..executors.base import WdspecExecutor  # noqa: F401
from ..executors.executorwebdriver import (WebDriverTestharnessExecutor,  # noqa: F401
                                           WebDriverRefTestExecutor,  # noqa: F401
                                           WebDriverCrashtestExecutor)  # noqa: F401

__wptrunner__ = {
    "product": "crane",
    "check_args": "check_args",
    "browser": "CraneBrowser",
    "browser_kwargs": "browser_kwargs",
    "executor_kwargs": "executor_kwargs",
    "env_options": "env_options",
    "env_extras": "env_extras",
    "timeout_multiplier": "get_timeout_multiplier",
    "executor": {
        "testharness": "WebDriverTestharnessExecutor",
        "reftest": "WebDriverRefTestExecutor",
        "wdspec": "WdspecExecutor",
        "crashtest": "WebDriverCrashtestExecutor"
    }
}


def check_args(**kwargs):
    # Crane's binary IS the webdriver, so we just need the binary
    # If no binary specified, we'll try to find it in the build directory
    pass


def browser_kwargs(logger, test_type, run_info_data, config, **kwargs):
    # For Crane, the binary is the WebDriver server
    binary = kwargs.get("binary")
    webdriver_binary = kwargs.get("webdriver_binary")

    # If webdriver_binary not specified but binary is, use binary as webdriver
    if webdriver_binary is None and binary is not None:
        webdriver_binary = binary

    # Default to zig-out/bin/crane if nothing specified
    if webdriver_binary is None:
        import os
        default_path = os.path.join(os.getcwd(), "zig-out", "bin", "crane")
        if os.path.exists(default_path):
            webdriver_binary = default_path

    return {
        "binary": binary,
        "webdriver_binary": webdriver_binary,
        "webdriver_args": kwargs.get("webdriver_args", [])
    }


def executor_kwargs(logger, test_type, test_environment, run_info_data,
                    **kwargs):
    executor_kwargs = base_executor_kwargs(test_type, test_environment, run_info_data, **kwargs)
    executor_kwargs["capabilities"] = {
        "browserName": "crane",
        "browserVersion": "0.1.0",
    }
    return executor_kwargs


def env_options():
    return {}


def env_extras(**kwargs):
    return []


class CraneBrowser(WebDriverBrowser):
    """Crane browser controlled via its built-in WebDriver server."""

    def make_command(self):
        """Build command to start Crane with WebDriver server."""
        cmd = [self.webdriver_binary, "--port", str(self.port)]
        cmd.extend(self.webdriver_args)
        return cmd
