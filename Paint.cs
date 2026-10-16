using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

namespace PaintNativeApp
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string electronPath = Path.Combine(appDir, "node_modules", "electron", "dist", "electron.exe");

                if (!File.Exists(electronPath))
                {
                    MessageBox.Show(
                        "Electron runtime not found at:\n" + electronPath + "\n\nPlease run 'npm install' in this folder.",
                        "Paint Launcher Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }

                // Prepare arguments: forward app directory and any arguments (e.g., opened image file)
                string arguments = "\"" + appDir.TrimEnd('\\') + "\"";
                if (args != null && args.Length > 0)
                {
                    foreach (string arg in args)
                    {
                        arguments += " \"" + arg + "\"";
                    }
                }

                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = electronPath,
                    Arguments = arguments,
                    WorkingDirectory = appDir,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                Process.Start(startInfo);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "Failed to launch Paint:\n" + ex.Message,
                    "Paint Launcher Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }
    }
}
