CREATE TYPE states AS ENUM (
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'District of Columbia',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
);

CREATE TABLE contestphyte_contests (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    owner_id INTEGER NOT NULL REFERENCES contestphyte_users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL,
    company_name TEXT NOT NULL,
    company_url TEXT NOT NULL,
    company_email TEXT NOT NULL,
    contest_name TEXT NOT NULL,
    image_url TEXT,
    contest_description TEXT,
    prize_value INTEGER NOT NULL,
    official_rules_url TEXT NOT NULL,
    business_mailing_address TEXT NOT NULL,
    business_state states NOT NULL,
    business_zip_code varchar(5) NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    impressions INTEGER DEFAULT '0'
);