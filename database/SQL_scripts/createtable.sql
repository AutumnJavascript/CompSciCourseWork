CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    description VARCHAR,
    role VARCHAR DEFAULT 'user',
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post(
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    title VARCHAR NOT NULL,
    description text,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    post_type VARCHAR NOT NULL
);

CREATE TABLE hashtag(
    hashtag VARCHAR NOT NULL,
    post_id INTEGER NOT NULL REFERENCES post(post_id),
    PRIMARY KEY(hashtag, post_id)
);

CREATE TABLE post_media(
    post_media_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES post(post_id),
    filename VARCHAR NOT NULL,
    mimetype VARCHAR NOT NULL
);

CREATE TABLE following(
    follower_id INTEGER NOT NULL REFERENCES users(user_id),
    following_id INTEGER NOT NULL REFERENCES users(user_id),
    status VARCHAR DEFAULT 'pending',
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE friend(
    requester_id INTEGER NOT NULL REFERENCES users(user_id),
    requestee_id INTEGER NOT NULL REFERENCES users(user_id),
    status VARCHAR DEFAULT 'pending',
    PRIMARY KEY (requester_id, requestee_id)
);

CREATE TABLE report(
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(user_id),
    reportee_id INTEGER NOT NULL REFERENCES users(user_id),
    status VARCHAR DEFAULT 'Pending',
    description text,
    post_id INTEGER REFERENCES post(post_id)
);

CREATE TABLE conversation(
    conversation_id SERIAL PRIMARY KEY,
    isgroupchat BOOLEAN NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conversation_title VARCHAR NOT NULL,
    conversation_description VARCHAR,
    creator_id INTEGER NOT NULL REFERENCES users(user_id)
);

CREATE TABLE message(
    message_id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(user_id),
    conversation_id INTEGER NOT NULL REFERENCES conversation(conversation_id),
    messagetext TEXT NOT NULL,
    has_media BOOLEAN DEFAULT FALSE
);

CREATE TABLE message_media(
    message_media_id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES message(message_id),
    filename VARCHAR NOT NULL,
    mimetype VARCHAR NOT NULL
);

CREATE TABLE message_reply(
    replier_message_id INTEGER NOT NULL,
    repliee_message_id INTEGER NOT NULL,
    PRIMARY KEY (replier_message_id, repliee_message_id)
);

CREATE TABLE conversation_member(
    conversation_id INTEGER NOT NULL REFERENCES conversation(conversation_id),
    member_id INTEGER NOT NULL REFERENCES users(user_id),
    PRIMARY KEY (conversation_id, member_id),
    membership VARCHAR DEFAULT 'member',
    time_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_like(
    post_id INTEGER NOT NULL REFERENCES post(post_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    PRIMARY KEY (post_id, user_id),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_saved(
    post_id INTEGER NOT NULL REFERENCES post(post_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    PRIMARY KEY (post_id, user_id),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_comment(
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES post(post_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    comment VARCHAR(512) NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comment_reply(
    reply_id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES post_comment(comment_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    message VARCHAR NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collection_ownership(
    collection_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(user_id),
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public BOOLEAN DEFAULT FALSE
);

CREATE TABLE collection_post(
    collection_post_id SERIAL PRIMARY KEY,
    collection_id INTEGER NOT NULL REFERENCES collection_ownership(collection_id),
    post_id INTEGER NOT NULL REFERENCES post(post_id),
    created_time TIMESTAMP  DEFAULT CURRENT_TIMESTAMP
);


