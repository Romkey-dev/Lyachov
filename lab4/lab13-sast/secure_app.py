import os
import sqlite3
from flask import Flask, request, jsonify, render_template_string
import subprocess

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>User Management</title>
</head>
<body>
    <h1>Secure User Management</h1>
    <form action="/user" method="GET">
        <label>User ID:</label>
        <input type="text" name="id">
        <button type="submit">Get User</button>
    </form>

    <form action="/search" method="GET">
        <label>Search by username:</label>
        <input type="text" name="username">
        <button type="submit">Search</button>
    </form>

    <div id="result">
        {content}
    </div>
</body>
</html>
"""

ALLOWED_COMMANDS = ['date', 'whoami', 'hostname']
API_KEY = os.environ.get('API_KEY')


def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    cursor.execute("INSERT OR IGNORE INTO users (id, username, email, password) VALUES (1, 'admin', 'admin@example.com', 'admin123')")
    cursor.execute("INSERT OR IGNORE INTO users (id, username, email, password) VALUES (2, 'user', 'user@example.com', 'user123')")
    conn.commit()
    conn.close()


def validate_integer(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValueError('Invalid integer')


@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE.format(content="<p>Enter user ID or search by username</p>"))


@app.route('/user')
def get_user():
    user_id = request.args.get('id')
    if not user_id:
        return jsonify({'error': 'Missing id parameter'}), 400

    try:
        uid = validate_integer(user_id)
    except ValueError:
        return jsonify({'error': 'Invalid user id'}), 400

    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, email FROM users WHERE id = ?', (uid,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({'id': user[0], 'username': user[1], 'email': user[2]})
    return jsonify({'error': 'User not found'}), 404


@app.route('/search')
def search_users():
    username = request.args.get('username', '')
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, username, email FROM users WHERE username LIKE ?', (f'%{username}%',))
    rows = cursor.fetchall()
    conn.close()
    result = [{'id': row[0], 'username': row[1], 'email': row[2]} for row in rows]
    return jsonify(result)


@app.route('/api/data')
def get_data():
    return jsonify({'message': 'API key is stored securely in environment variables'})


@app.route('/execute')
def execute_command():
    cmd = request.args.get('cmd', '')
    if not cmd:
        return jsonify({'error': 'cmd parameter required'}), 400

    if cmd not in ALLOWED_COMMANDS:
        return jsonify({'error': 'Command not allowed'}), 403

    output = subprocess.check_output([cmd], stderr=subprocess.STDOUT)
    return jsonify({'output': output.decode('utf-8', errors='ignore')})


if __name__ == '__main__':
    if not API_KEY:
        raise EnvironmentError('API_KEY environment variable must be set')

    init_db()
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5001)
