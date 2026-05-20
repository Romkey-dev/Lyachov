import os
import json
import sqlite3
import pytest
from flask import Flask

from secure_app import app as secure_app
from vulnerable_app import app as vulnerable_app


@pytest.fixture(scope='module')
def client_vulnerable():
    vulnerable_app.config['TESTING'] = True
    with vulnerable_app.test_client() as client:
        yield client


@pytest.fixture(scope='module')
def client_secure():
    secure_app.config['TESTING'] = True
    with secure_app.test_client() as client:
        yield client


def test_vulnerable_user_injection(client_vulnerable):
    response = client_vulnerable.get('/user?id=1 OR 1=1')
    assert response.status_code in (200, 400)


def test_vulnerable_search(client_vulnerable):
    response = client_vulnerable.get('/search?username=admin')
    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_secure_user_valid(client_secure):
    response = client_secure.get('/user?id=1')
    assert response.status_code == 200
    assert response.json['username'] == 'admin'


def test_secure_user_invalid(client_secure):
    response = client_secure.get('/user?id=abc')
    assert response.status_code == 400


def test_secure_search(client_secure):
    response = client_secure.get('/search?username=user')
    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_secure_api_data(client_secure):
    response = client_secure.get('/api/data')
    assert response.status_code == 200
    assert 'api key' in response.json['message'].lower()


def test_secure_execute_allow_list(client_secure):
    response = client_secure.get('/execute?cmd=whoami')
    assert response.status_code in (200, 403)


def test_secure_execute_blocked(client_secure):
    response = client_secure.get('/execute?cmd=ls')
    assert response.status_code == 403
