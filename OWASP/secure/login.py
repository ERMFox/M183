import requests

url = "http://localhost:3000/login"

def login():
    username = 'user'
    password = input("Please type in your password:\n")
    two_factor_code = input("Please enter the two-factor authentication code:\n")

    response = requests.post(url, json={'username': username, 'password': password, 'twoFactorCode': two_factor_code})
    if response.status_code == 200:
        print(f'[SUCCESS] Logged in with {username}:{password}')
        return
    else:
        print(f'[FAIL] Failed login with {username}:{password}')
        print(response.status_code)

if __name__ == '__main__':
    login()
