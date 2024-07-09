USE m183_lb2;

-- Insert roles
insert into roles (ID, title) values (2, 'User');
insert into roles (ID, title) values (1, 'Admin');

-- Insert users
insert into users (ID, username, password, secret_key) values (1, 'admin1', 'Awesome.Pass34', 'supersecret');
insert into users (ID, username, password, secret_key) values (2, 'user1', 'Amazing.Pass23', 'awesomesecret');

-- Insert permissions
insert into permissions(ID, userID, roleID) values(null, 1, 1);
insert into permissions(ID, userID, roleID) values(null, 2, 2);

CREATE TABLE IF NOT EXISTS 'login_attempts'(
    `ID` bigint(20) NOT NULL,
    `userIP` varchar(255) NOT NULL,
    `tries` integer NOT NULL,
    `lock_untill` varchar(255) NOT NULL,
)


-- Remove triggers
DROP TRIGGER IF EXISTS before_update_users;

-- Remove function
