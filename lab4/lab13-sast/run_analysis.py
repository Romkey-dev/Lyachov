import os
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def run_command(command, env=None):
    print('> ' + ' '.join(command))
    result = subprocess.run(command, cwd=SCRIPT_DIR, env=env or os.environ.copy(), text=True)
    if result.returncode != 0:
        raise SystemExit(result.returncode)


if __name__ == '__main__':
    env = os.environ.copy()
    print('Installing dependencies...')
    run_command([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])

    print('\nRunning Bandit on vulnerable_app.py...')
    run_command([sys.executable, '-m', 'bandit', '-r', 'vulnerable_app.py', '-f', 'txt'])

    print('\nRunning Bandit on secure_app.py...')
    run_command([sys.executable, '-m', 'bandit', '-r', 'secure_app.py', '-f', 'txt'])

    print('\nRunning pytest...')
    env['API_KEY'] = env.get('API_KEY', 'test-key')
    run_command([sys.executable, '-m', 'pytest', '-q'])
