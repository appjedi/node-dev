CREATE DEFINER = `root` @`localhost` PROCEDURE `usp_user_save`(
    p_user_id int(11),
    p_username varchar(45),
    p_password1 varchar(45),
    p_password2 varchar(45),
    p_last_name varchar(45),
    p_first_name varchar(45),
    p_email varchar(255),
    p_role_id int(11),
    p_status int(11)
) main: BEGIN -- user_id,username,last_name,first_name,email,password, role_id, status
DECLARE errorCount INT;
SET errorCount = 0;
INSERT INTO logger (stamp, message)
VALUES(
        SYSDATE(),
        CONCAT(p_user_id, ' usp_user_save ', p_username)
    );
IF p_username IS NULL
OR length(p_username) < 4 THEN
SET errorCount = errorCount + 1;
SELECT -1 AS `status`,
    0 AS id,
    'Invalid or missing user name.' AS message,
    2 AS `level`;
LEAVE main;
END IF;
IF p_user_id = 0 THEN
INSERT INTO `test`.`users` (
        `username`,
        `last_name`,
        `first_name`,
        `email`,
        `password`,
        `role_id`,
        `status`,
        `created`,
        `updated`
    )
VALUES (
        p_username,
        p_last_name,
        p_first_name,
        p_email,
        PASSWORD(p_password1),
        p_role_id,
        p_status,
        SYSDATE(),
        null
    );
SELECT 1 AS `status`,
    last_insert_id() AS id,
    'User created.' AS message,
    1 AS `level`;
ELSE
UPDATE `test`.`users`
SET `username` = p_username,
    `last_name` = p_last_name,
    `first_name` = p_first_name,
    `email` = p_email,
    `password` = PASSWORD(p_password1),
    `role_id` = p_role_id,
    `status` = p_status,
    `updated` = SYSDATE()
WHERE `user_id` = p_user_id;
SELECT 1 AS `status`,
    p_user_id AS id,
    'User updated.' AS message,
    1 AS `level`;
END IF;
END