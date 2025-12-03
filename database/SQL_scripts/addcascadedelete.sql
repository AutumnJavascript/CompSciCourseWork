alter table post
drop constraint post_user_id_fkey;

alter table post 
add constraint post_user_id_fkey
foreign key (user_id)
references users(user_id)
on delete cascade;
 

alter table hashtag
drop constraint hashtag_post_id_fkey;

alter table hashtag 
add constraint hashtag_post_id_fkey
foreign key (post_id)
references post(post_id)
on delete cascade;
 
 
alter table post_media
drop constraint post_media_post_id_fkey;

alter table post_media 
add constraint post_media_post_id_fkey
foreign key (post_id)
references post(post_id)
on delete cascade;
 
 
alter table following
drop constraint following_follower_id_fkey;

alter table following
add constraint following_follower_id_fkey
foreign key (follower_id)
references users(user_id)
on delete cascade;
 
 
alter table following
drop constraint following_following_id_fkey;

alter table following
add constraint following_following_id_fkey
foreign key (following_id)
references users(user_id)
on delete cascade;
 
 
alter table friend
drop constraint friend_requester_id_fkey;

alter table following
add constraint friend_requester_id_fkey
foreign key (requester_id)
references users(user_id)
on delete cascade;
 
 
alter table friend
drop constraint friend_requestee_id_fkey;

alter table following
add constraint friend_requestee_id_fkey
foreign key (requestee_id)
references users(user_id)
on delete cascade;
 
 
alter table report
drop constraint report_reporter_id_fkey;

alter table report
add constraint report_reporter_id_fkey
foreign key (reporter_id)
references users(user_id)
on delete cascade;
 
 
alter table report
drop constraint report_reportee_id_fkey;

alter table report
add constraint report_reportee_id_fkey
foreign key (reportee_id)
references users(user_id)
on delete cascade;
 
 
alter table report
drop constraint report_post_id_fkey;

alter table report
add constraint report_post_id_fkey
foreign key (post_id)
references post(post_id)
on delete cascade;
 
 
alter table conversation
drop constraint conversation_creator_id_fkey;

alter table conversation
add constraint conversation_creator_id_fkey
foreign key (creator_id)
references users(user_id)
on delete cascade;
 
 
alter table message
drop constraint message_sender_id_fkey;

alter table message
add constraint message_sender_id_fkey
foreign key (sender_id)
references users(user_id)
on delete cascade;
 
 
alter table message
drop constraint message_conversation_id_fkey;

alter table message
add constraint message_conversation_id_fkey
foreign key (conversation_id)
references conversation(conversation_id)
on delete cascade;
 
 
alter table message_media
drop constraint message_media_message_id_fkey;

alter table message_media
add constraint message_media_message_id_fkey
foreign key (message_id)
references message(message_id)
on delete cascade;
 
 
alter table conversation_member
drop constraint conversation_member_conversation_id_fkey;

alter table conversation_member
add constraint conversation_member_conversation_id_fkey
foreign key (conversation_id)
references conversation(conversation_id)
on delete cascade;
 
 
alter table conversation_member
drop constraint conversation_member_member_id_fkey;

alter table conversation_member
add constraint conversation_member_member_id_fkey
foreign key (member_id)
references users(user_id)
on delete cascade;
 
 
alter table post_like
drop constraint post_like_post_id_fkey;

alter table post_like
add constraint post_like_post_id_fkey
foreign key (post_id)
references post(post_id)
on delete cascade;
 
 
alter table post_like
drop constraint post_like_user_id_fkey;

alter table post_like
add constraint post_like_user_id_fkey
foreign key (user_id)
references users(user_id)
on delete cascade;
 
 
alter table user_saved
drop constraint user_saved_post_id_fkey;

alter table user_saved
add constraint user_saved_post_id_fkey
foreign key (post_id)
references post(post_id)
on delete cascade;
 
 
alter table user_saved
drop constraint user_saved_user_id_fkey;

alter table user_saved
add constraint user_saved_user_id_fkey
foreign key (user_id)
references users(user_id)
on delete cascade;
 
 
alter table post_comment
drop constraint post_comment_post_id_fkey;

alter table post_comment
add constraint post_comment_post_id_fkey
foreign key (post_id)
references post(post_id)
on delete cascade;
 
 
alter table post_comment
drop constraint post_comment_user_id_fkey;

alter table post_comment
add constraint post_comment_user_id_fkey
foreign key (user_id)
references users(user_id)
on delete cascade;
 
 
alter table comment_reply
drop constraint comment_reply_comment_id_fkey;

alter table comment_reply
add constraint comment_reply_comment_id_fkey
foreign key (comment_id)
references post_comment(comment_id)
on delete cascade;
 
 
alter table comment_reply
drop constraint comment_reply_user_id_fkey;

alter table comment_reply
add constraint comment_reply_user_id_fkey
foreign key (user_id)
references users(user_id)
on delete cascade;
 
 
alter table collection_ownership
drop constraint collection_ownership_owner_id_fkey;

alter table collection_ownership
add constraint collection_ownership_owner_id_fkey
foreign key (owner_id)
references users(user_id)
on delete cascade;
 
 
alter table collection_post
drop constraint collection_post_collection_id_fkey;

alter table collection_post
add constraint collection_post_collection_id_fkey
foreign key (collection_id)
references collection_ownership(collection_id)
on delete cascade;
 
 
alter table collection_post
drop constraint collection_post_post_id_fkey;

alter table collection_post
add constraint collection_post_post_id_fkey
foreign key (post_id)
references post(post_id)
on delete cascade;
 
 
