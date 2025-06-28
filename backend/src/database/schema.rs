// @generated automatically by Diesel CLI.

diesel::table! {
    categories (id) {
        id -> Uuid,
        name -> Varchar,
        description -> Nullable<Text>,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    learning_activities (id) {
        id -> Uuid,
        activity_type -> Varchar,
        date -> Date,
        count -> Int4,
        created_at -> Timestamptz,
    }
}

diesel::table! {
    words (id) {
        id -> Uuid,
        word -> Varchar,
        meaning -> Text,
        translation -> Text,
        category -> Varchar,
        part_of_speech -> Varchar,
        example -> Nullable<Text>,
        created_at -> Timestamptz,
        updated_at -> Timestamptz,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    categories,
    learning_activities,
    words,
);