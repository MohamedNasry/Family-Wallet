--
-- PostgreSQL database dump
--

\restrict N4k4mYISmCvg4aPVDpdKTfMEFKCL2h3aQNmSPYQJO5JLMbpgPgbG2aU5E0DfT9n

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: bill_source; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bill_source AS ENUM (
    'MANUAL',
    'AI_IMAGE',
    'OCR'
);


ALTER TYPE public.bill_source OWNER TO postgres;

--
-- Name: bill_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.bill_status AS ENUM (
    'PENDING',
    'PARTIAL',
    'PAID'
);


ALTER TYPE public.bill_status OWNER TO postgres;

--
-- Name: parental_approval_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.parental_approval_status AS ENUM (
    'PENDING',
    'APPROVED',
    'DECLINED'
);


ALTER TYPE public.parental_approval_status OWNER TO postgres;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_method AS ENUM (
    'BANK',
    'CASH',
    'POINTS'
);


ALTER TYPE public.payment_method OWNER TO postgres;

--
-- Name: point_transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.point_transaction_type AS ENUM (
    'SPEND',
    'TOPUP',
    'REFUND'
);


ALTER TYPE public.point_transaction_type OWNER TO postgres;

--
-- Name: split_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.split_status AS ENUM (
    'UNPAID',
    'PAID',
    'LATE'
);


ALTER TYPE public.split_status OWNER TO postgres;

--
-- Name: split_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.split_type AS ENUM (
    'EQUAL',
    'PERCENTAGE',
    'FIXED'
);


ALTER TYPE public.split_type OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'PARENT',
    'CHILD',
    'MEMBER'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_user (
    user_id bigint NOT NULL,
    wallet_id bigint NOT NULL,
    full_name character varying(150) NOT NULL,
    email character varying(150),
    password character varying(255) NOT NULL,
    phone character varying(30),
    role public.user_role DEFAULT 'MEMBER'::public.user_role NOT NULL,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.app_user OWNER TO postgres;

--
-- Name: app_user_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.app_user ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.app_user_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bank_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_account (
    bank_account_id integer NOT NULL,
    user_id integer NOT NULL,
    bank_name character varying(100) NOT NULL,
    masked_card_number character varying(20) NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    balance numeric(10,2) DEFAULT 0
);


ALTER TABLE public.bank_account OWNER TO postgres;

--
-- Name: bank_account_bank_account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bank_account ALTER COLUMN bank_account_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bank_account_bank_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill (
    bill_id integer NOT NULL,
    wallet_id integer NOT NULL,
    created_by integer,
    category_id integer,
    title character varying(150) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    currency character varying(10) NOT NULL,
    source public.bill_source DEFAULT 'MANUAL'::public.bill_source,
    image_url text,
    status public.bill_status DEFAULT 'PENDING'::public.bill_status,
    bill_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bill_total_amount_check CHECK ((total_amount >= (0)::numeric))
);


ALTER TABLE public.bill OWNER TO postgres;

--
-- Name: bill_bill_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bill ALTER COLUMN bill_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bill_bill_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bill_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_item (
    item_id integer NOT NULL,
    bill_id integer NOT NULL,
    name character varying(150) NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL,
    CONSTRAINT bill_item_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT bill_item_total_price_check CHECK ((total_price >= (0)::numeric)),
    CONSTRAINT bill_item_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.bill_item OWNER TO postgres;

--
-- Name: bill_item_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bill_item ALTER COLUMN item_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bill_item_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bill_ocr_draft; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_ocr_draft (
    ocr_id integer NOT NULL,
    wallet_id integer NOT NULL,
    user_id integer NOT NULL,
    bill_id integer,
    image_url text NOT NULL,
    extracted_text text,
    extracted_title character varying(150),
    extracted_total numeric(12,2),
    extracted_currency character varying(10),
    extracted_bill_date date,
    confirmed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bill_ocr_draft OWNER TO postgres;

--
-- Name: bill_ocr_draft_ocr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bill_ocr_draft ALTER COLUMN ocr_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bill_ocr_draft_ocr_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bill_ocr_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_ocr_result (
    ocr_id integer NOT NULL,
    bill_id integer NOT NULL,
    image_url text NOT NULL,
    extracted_text text,
    extracted_total numeric(12,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bill_ocr_result OWNER TO postgres;

--
-- Name: bill_ocr_result_ocr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bill_ocr_result ALTER COLUMN ocr_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bill_ocr_result_ocr_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bill_split; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bill_split (
    split_id integer NOT NULL,
    bill_id integer NOT NULL,
    user_id integer NOT NULL,
    split_type public.split_type DEFAULT 'EQUAL'::public.split_type NOT NULL,
    percentage numeric(5,2),
    fixed_amount numeric(12,2),
    amount_due numeric(12,2) NOT NULL,
    status public.split_status DEFAULT 'UNPAID'::public.split_status,
    CONSTRAINT bill_split_amount_due_check CHECK ((amount_due >= (0)::numeric))
);


ALTER TABLE public.bill_split OWNER TO postgres;

--
-- Name: bill_split_split_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bill_split ALTER COLUMN split_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bill_split_split_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_harmful boolean DEFAULT false
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: category_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.category ALTER COLUMN category_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.category_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: child_points_wallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.child_points_wallet (
    points_wallet_id integer NOT NULL,
    child_user_id integer NOT NULL,
    parent_user_id integer NOT NULL,
    points_balance integer DEFAULT 0,
    conversion_rate numeric(12,4) DEFAULT 1 NOT NULL,
    CONSTRAINT child_points_wallet_points_balance_check CHECK ((points_balance >= 0))
);


ALTER TABLE public.child_points_wallet OWNER TO postgres;

--
-- Name: child_points_wallet_points_wallet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.child_points_wallet ALTER COLUMN points_wallet_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.child_points_wallet_points_wallet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: family_wallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.family_wallet (
    wallet_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    country character varying(100) NOT NULL,
    currency character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.family_wallet OWNER TO postgres;

--
-- Name: family_wallet_wallet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.family_wallet ALTER COLUMN wallet_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.family_wallet_wallet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: join_invite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.join_invite (
    invite_id bigint NOT NULL,
    wallet_id bigint NOT NULL,
    invite_code character varying(100) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false
);


ALTER TABLE public.join_invite OWNER TO postgres;

--
-- Name: join_invite_invite_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.join_invite ALTER COLUMN invite_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.join_invite_invite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: parental_approval_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parental_approval_request (
    approval_id integer NOT NULL,
    wallet_id integer NOT NULL,
    child_id integer NOT NULL,
    category_id integer,
    title character varying(150) NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(10) NOT NULL,
    status public.parental_approval_status DEFAULT 'PENDING'::public.parental_approval_status NOT NULL,
    requested_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_by bigint,
    reviewed_at timestamp without time zone,
    decline_reason text,
    CONSTRAINT parental_approval_request_amount_check CHECK ((amount >= (0)::numeric))
);


ALTER TABLE public.parental_approval_request OWNER TO postgres;

--
-- Name: parental_approval_request_approval_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.parental_approval_request ALTER COLUMN approval_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.parental_approval_request_approval_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: parental_blocked_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parental_blocked_category (
    blocked_category_id integer NOT NULL,
    wallet_id integer NOT NULL,
    category_id integer NOT NULL,
    blocked boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.parental_blocked_category OWNER TO postgres;

--
-- Name: parental_blocked_category_blocked_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.parental_blocked_category ALTER COLUMN blocked_category_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.parental_blocked_category_blocked_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment (
    payment_id integer NOT NULL,
    bill_id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    method public.payment_method NOT NULL,
    paid_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payment_amount_check CHECK ((amount > (0)::numeric))
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- Name: payment_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payment ALTER COLUMN payment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.payment_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: point_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.point_transaction (
    transaction_id integer NOT NULL,
    points_wallet_id integer NOT NULL,
    child_user_id integer NOT NULL,
    bank_account_id integer,
    points_amount integer NOT NULL,
    real_amount numeric(12,2) NOT NULL,
    type public.point_transaction_type NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT point_transaction_real_amount_check CHECK ((real_amount >= (0)::numeric))
);


ALTER TABLE public.point_transaction OWNER TO postgres;

--
-- Name: point_transaction_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.point_transaction ALTER COLUMN transaction_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.point_transaction_transaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: app_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_user (user_id, wallet_id, full_name, email, password, phone, role, joined_at) FROM stdin;
1	1	Ali Ahmed	ali@example.com	$2b$10$5IozoyQFy4K92Ge3UyP0.OOiEHthgHKhmql6BSjH5TI2d/D/pmvfO	\N	PARENT	2026-04-28 15:23:12.250509
2	1	Sara Ahmed	sara@example.com	$2b$10$XhzlGf1AEpqJ4N/tzKJ4Quzw1YbfceCd3y2ABJBdrY9yuVL/Wxf0y	\N	CHILD	2026-04-28 15:25:16.136375
3	2	mohamed En-nasry	mohamed@gmail.com	$2b$10$CtvZ39jFyjmNDh9nc/1ymePgrGiTZ8obsU1p4JwfOio6FygELWTN6	\N	PARENT	2026-04-29 20:38:24.18428
4	3	moahed	shjsj	$2b$10$tV//glV59cLCmutZFHgY8e67IReOPYQwBfYfFCIXngX1YSNGcmsCm	\N	PARENT	2026-04-29 21:21:38.457539
5	3	mjfj	dd	$2b$10$pjN/jzWGwKxBtI2P7VMO4Oo6kcxfsICtZnZ.hPzk5jMs/rNEoNALG	\N	CHILD	2026-04-29 21:22:08.799142
6	4	moahemd	m@gmail.com	$2b$10$ZZfAMic.aIBQPtalXHMl/eeRDUzmSgODu8Ngb/rBunoIrnE9U4C4i	\N	PARENT	2026-04-29 21:26:31.308349
7	5	kamal	kamal@example.com	$2b$10$HoczhjP8tVKvVKpKMUlLIuh0HPqnSlWkf/EYf.rsn35r/oL4hU4oe	\N	PARENT	2026-04-30 17:42:41.330839
8	1	Ahmed Nasir	Ahmed12@example.com	$2b$10$UQnZZI0pGo6qvvw34mo8veGKwCeTZXyoqg5YI2nA2cz5p0yKYCS9W	\N	MEMBER	2026-05-01 15:00:44.490671
9	6	Mohamed	Mohamed1@example.com	$2b$10$t.qjAw6m9LGqF0T9zBC7IeULpoVZ/aXzM7ykiMk8jx5NDqSAn2gSq	\N	PARENT	2026-05-01 16:40:18.672987
10	6	jaber	jaber@example.com	$2b$10$NuOvkefyy/iYef7yFENdwujtakzRQX4Ag1Am8biIl0QzYDC4B.Uiu	\N	MEMBER	2026-05-01 16:41:00.205401
11	1	Kamal	Ahmed@example.com	$2b$10$aWmiOvmNlAk08EbeBw0kAuVjpDhQti9nZmFC5IyeB.ljHn7X5fvxO	\N	MEMBER	2026-05-01 16:45:27.246047
12	7	Said nasry	aliSaid@example.com	$2b$10$L.ver8cWmIixcK7IidU92O9CaqsVYqdJlwjOmvHzMBIsgD7l1OiQ2	\N	PARENT	2026-05-01 18:09:35.074087
13	8	said ali	alisaid@example.com	$2b$10$6AqnU97tGZS5lzozF.ObK.pJYu5/jQti4axRY6io4aeHFCAHEvKAG	\N	PARENT	2026-05-01 18:11:45.562487
14	8	jjjjk	ali21@example.com	$2b$10$qFLptiiohUcq4R4RrW74Eeo.o0tsKptfbW9Qvow9XhBHwnslxOEGq	\N	MEMBER	2026-05-01 18:15:27.334873
15	8	hhd	ali33@example.com	$2b$10$1QEHidfO3kMhUycJ9JZCwOt0AUbKcklYqgytD1x09y1vwcSUYiiW2	\N	MEMBER	2026-05-01 18:17:04.23887
\.


--
-- Data for Name: bank_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_account (bank_account_id, user_id, bank_name, masked_card_number, is_default, balance) FROM stdin;
2	10	CIH	232333334443444	t	1000.00
1	1	CIH Bank	4242424242421234	t	4091.77
\.


--
-- Data for Name: bill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill (bill_id, wallet_id, created_by, category_id, title, total_amount, currency, source, image_url, status, bill_date, created_at) FROM stdin;
2	1	1	1	Supermarket Bill	126.50	MAD	MANUAL	\N	PENDING	2026-04-28	2026-04-29 15:24:54.95695
3	1	1	1	FAMILY MARKET	128.15	MAD	OCR	/uploads/bills/1777474050557-988770344.png	PENDING	2026-04-28	2026-04-29 16:12:37.261938
4	1	1	15	FAMILY MARKET	128.15	MAD	OCR	/uploads/bills/1777591451069-6063585.jpg	PENDING	2026-04-28	2026-05-01 00:25:55.011047
5	1	1	1	GREEN BASKET SUPERMARKET	182.77	MAD	OCR	/uploads/bills/1777593656193-366766270.jpg	PENDING	2026-05-01	2026-05-01 01:01:45.980653
6	1	1	1	Casa Fresh mart	187.00	MAD	OCR	/uploads/bills/1777595920913-162908413.jpg	PENDING	2026-05-02	2026-05-01 01:40:06.312752
7	1	1	3	‎FACTURE D'ÉLECTRICITÉ	583.62	MAD	OCR	/uploads/bills/1777631592689-225594372.jpg	PENDING	2024-04-01	2026-05-01 11:33:57.183408
10	1	1	1	City Market	166.00	SAR	OCR	/uploads/bills/1777634557691-785320133.jpg	PARTIAL	2026-05-01	2026-05-01 12:23:31.988097
9	1	1	1	Marcket	50.00	MAD	MANUAL	\N	PARTIAL	2026-05-01	2026-05-01 12:21:34.128616
8	1	1	1	Marcket	100.00	MAD	MANUAL	\N	PARTIAL	2026-05-01	2026-05-01 12:10:20.99733
1	1	1	1	Grocery Bill	126.50	MAD	MANUAL	\N	PARTIAL	2026-04-28	2026-04-29 15:23:12.284941
11	1	1	1	CASA FRESH MART	555.00	MAD	OCR	/uploads/bills/1777656130516-763635581.jpg	PAID	2026-05-02	2026-05-01 18:22:20.779133
12	1	1	1	CASA FRESH MART	555.00	MAD	OCR	/uploads/bills/1777656406496-249580816.jpg	PENDING	2026-05-02	2026-05-01 18:26:52.746613
\.


--
-- Data for Name: bill_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_item (item_id, bill_id, name, quantity, unit_price, total_price) FROM stdin;
1	2	Milk	2	8.00	16.00
2	2	Bread	1	3.00	3.00
3	2	Rice	1	20.00	20.00
\.


--
-- Data for Name: bill_ocr_draft; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_ocr_draft (ocr_id, wallet_id, user_id, bill_id, image_url, extracted_text, extracted_title, extracted_total, extracted_currency, extracted_bill_date, confirmed, created_at) FROM stdin;
1	1	1	3	/uploads/bills/1777474050557-988770344.png	FAMILY MARKET\n123 Main Street, Casablanca\nTel: 0522-123456\nDate: 2026-04-28\nTime: 14:35\nReceipt No: 10458\nCashier: Sara\nMilk 2 x 8.00 16.00\nBread 1% 3.00 3.00\nRice 1x 20800 20,00\nApples 212580 25400\nChicken 1x 4260 0\nTea 1x 10.00 10.00\nSubtotal 116.50\nTax 10% 11.65\nTOTAL 128.15\nCurrency: MAD\nPayment: Cash\nThank you for shopping!\n	FAMILY MARKET	116.50	MAD	2026-04-28	t	2026-04-29 15:48:15.003008
2	1	1	4	/uploads/bills/1777591451069-6063585.jpg	FAMILY MARKET\n123 Main Street, Casablanca\nTel: 0522-123456\nDate: 2026-04-28\nTime: 14:35\nReceipt No: 10458\nCashier: Sara\nMilk 2 x 8.00 16.00\nBread 1% 3.00 3.00\nRice 1x 20800 20,00\nApples 212580 25400\nChicken 1x 4260 0\nTea 1x 10.00 10.00\nSubtotal 116.50\nTax 10% 11.65\nTOTAL 128.15\nCurrency: MAD\nPayment: Cash\nThank you for shopping!\n	FAMILY MARKET	128.15	MAD	2026-04-28	t	2026-05-01 00:24:12.640351
3	1	1	\N	/uploads/bills/1777592138931-72438421.jpg	FAMILY MARKET\n123 Main Street, Casablanca\nTel: 0522-123456\nDate: 2026-04-28\nTime: 14:35\nReceipt No: 10458\nCashier: Sara\nMilk 2 x 8.00 16.00\nBread 1% 3.00 3.00\nRice 1x 20800 20,00\nApples 212580 25400\nChicken 1x 4260 0\nTea 1x 10.00 10.00\nSubtotal 116.50\nTax 10% 11.65\nTOTAL 128.15\nCurrency: MAD\nPayment: Cash\nThank you for shopping!\n	FAMILY MARKET	128.15	MAD	2026-04-28	f	2026-05-01 00:35:40.380974
4	1	1	5	/uploads/bills/1777593656193-366766270.jpg	GREEN BASKET SUPERMARKET\n45 Avenue Hassan II, Rabat\nTel: 0537 98 76 54\nDate: 2026-05-01\nTime: 18:42\nReceipt #: 00091824\nCashier: Salma\nTtem Oty Unit Price Total\nOlive 011 (IL) 1 59.90 59.90\nEggs (12 pes) 1 18.50 0\nYogurt Pack 2 12.00 24.00\nTomatoes (2kg) 1 Bah 1975\nPasta B 6.80 0\nCheese i 21.00 0\nSubtotal: 166.15 MAD\nTax (10%): 16.62 MAD\nTOTAL 182.77 MAD\nPayment: Card\nSee you again!\n	GREEN BASKET SUPERMARKET	182.77	MAD	2026-05-01	t	2026-05-01 01:01:01.380818
5	1	1	6	/uploads/bills/1777595920913-162908413.jpg	= Sashes\n= CASA FRESH MART =\n\n45 Hassan 11 Blvd, Rabat = eo\n537-555-210 SS\nDate; 2026-05-02 Time: 18:42 ES\n.. | Receipt No: | 20873 =\n—— Cashier: Youssef =\na Tomatoes 2 650 13.00 :\n= Olive Oil 1; ‏الس‎ 2\n\n| Eggs 1 beh BP -\n= Yogurt 4 375 15.00\n=. | Chicken i omen. 18 =\nmn 3 550 16.50\nEvite > ‏اس‎ 1\n\n+ 9 Subtotal 170.00\n- 17,00\nee TOTAL 187.00\n\n.. MAD\n\n; Payment Card\n	= Sashes	187.00	MAD	2026-05-02	t	2026-05-01 01:38:44.500385
6	1	1	\N	/uploads/bills/1777631353936-637204598.jpg	5 0 PS “lt\n‏فاتورة كهرباء شركة الكهرباء‎\n‏فاتورة ضريبية خدمة تعتمد عليها‎\nB F-2026-00421 ‏بيانات المشترك رقم الفاتورة‎\n‏المشتزك أحمد محمد‎\n2026-04-5 ‏اخ علي تاريخ الإصدار‎ aie!\n‏حي النخيل, شارع الملك فهد‎ coll ‏عنوان الخدمة‎\n2026-05-1 ‏تاريخ الاستحقاق‎ 10293847 sui,\n4 10293847 ‏رقم الحساب‎\n‏قراءات العداد‎\nMTR-778812 ‏نوع القراءة تاريخ القراءة القراءة ملاحظات رقم العداد‎\na - 12450 2026-03-15 ‏السابقة‎ Bel all\n‏العرفة سكنر‎\n2 - 12830 2026-04-15 ‏القراءة الحالية‎\n‏الاستهلاك 0 كيلو واطر.س‎\n) ‏وحدة‎ 1 = po. bly ‏كيلو‎ (\n‏تفاصيل الفاتورة‎\n‏الوصف المبلغ (ررس)‎ Fr] |\n285.00 ‏ووس‎ 0.75 x (yu. bla LS 380 ‏الاستهلاك الكهريائي‎\n285.00 - ‏المجموع الفرعي‎\n42.75 285.00 ‏ضريية القيمة المضافة (9615) 6 من‎\n‏إجمالي المبلغ المستحق يي‎\n‏معلومات مهمة ملخص الاستهلاك (كيلو واط.س)‎\n‏مفارنة مع نفس‎ A 1 ‏يرجى سداد الفاتورة قبل تاريخ الاستحقاق لتجنب تطييق غرامة التأخير.‎ *\n‏الاستهلاك | الشهر من العام السايق‎ ol ‏تعليق الخدمة.‎ pis ‏في حال عدم السداد؛ شر‎ ٠\n+8% 380 2026 ‏احتفظ بهذه الفاتورة للرجوع إليها عند الحاجة. أبريل‎ +\n+5% 350 2026 ‏مارس‎\n‎-3% 320 2026 ‏للتواصل والاستفسار فبرأير‎\n-7% 310 2026 ‏يناير‎ & 9200 11 000 )\n+ 6 340 2025 dus © wwweelectricity.sa ® ‏ل‎\n‎al ‏ملاحظة: قد تختلف نسبه المفارنة حسب عدد أيام الدورة.‎ care@electricity.sa\n222222222 2222222222222 22222222222222 lll ed sosssssssssacsssszszsssszsssszssssszzazzza@\nme ‏طرق السداد المتاحة بيانات السداد‎\nERE ‏مب ور‎ ay PAU\n‏حش جا‎ BV ‏امسح‎ F-2026-00421 ‏رقم الفاتورة:‎ M (oll) ‏الحساب البنكي‎\n‏ا‎ $l se 10293847 ‏رقم الحساب:‎ BE ‏مدى / بطاقة ائتمان‎\nmar 7 ‏الصراف الألي 18 المبلغ المستحق: 0 32735 رس‎\n2026-05-1 ‏تاريخ الاستحقاق:‎ A ‏مراكز خدمة المشتركين‎\n‏لاستخدامك الخدمات الإلكترونية للحفاظ على البيئة‎ ss ١\n	‏المشتزك أحمد محمد‎	35.00	SAR	2026-04-05	f	2026-05-01 11:29:20.478462
7	1	1	7	/uploads/bills/1777631592689-225594372.jpg	1 عياب\n= 2 -زقهي-\n‎FACTURE D'ÉLECTRICITÉ @‏ >\nالمكتب الوطني للكهرباء والماء الصالح للشرب\n‎Office National de l'Electricité et de l'Eau Potable‏\n‎N° Client: 12345678‏\n‎Référence : 2024 05 12345678 fn : Ahmed El Amrani‏\n‎Période : Du 01/04/2024 au 30/04/2024 Adresse: 15, Rue des Orangers‏\n‎Date d’émission: 05/05/2024 Hay Riad, Rabat 10100‏\n‎Date d’échéance : 20/05/2024‏\n‎RÉSUMÉDEFACTURE ——‏ ~~\n‎MONTANT À PAYER‏\n‎Ancien solde 0,00 DH‏\n‎Paiement reçu -0,00 DH 583,62 DH‏\n‎Consommation du mois 486,35 DH Merci de régler avant le‏\n20/05/2024\n‎TVA (20%) 97,27 DH‏\n‎Évitez les déplacements,‏ © —\n‎À ayez votre facture en ligne‏\n= ل ‎TOTAL À PAYER 583,62 DH‏\n‎DÉTAIL DE CONSOMMATION ree =‏ @(\n‎Compteur N° | Ancienindex | Nouvelindex | Consommation (kWh) | Prix unitaire (DH/kWh) | Montant (DH)‏\n‎RÉPARTITION DES MONTANTS‏ —\n‎HISTORIQUE DE CONSOMMATION (kWh)‏\n‎Consommation 386,37 DH | 600‏\n‎Redevance fixe 30,00 DH 450‏\n‎Frais de gestion 20,00 DH 300‏\n‎TVA (20%) 97,27 DH 150‏\n0\n‎TOTAL 583,62 DH Nov23 Déc23 Jan24 Fév24 Mar24 Avr24‏\n‎COUPON DE PAIEMENT MOYENS DE PAIEMENT‏\n‎N° Client : 12345678 Paiement en ligne : www.onee.ma‏\n‎Référence : 2024 05 12345678 =‏\n‎Montant à payer: 583,62 DH Mobile Banking‏\n‎Date d'échéance: 20/05/2024 ÉÉT Agences et Guichets ONEE‏\n‎HA .‏\n|\n‎R, te02000123‏\n‎du lundi au vendredi 8h à 18h © www.onee.ma‏\n	‎FACTURE D'ÉLECTRICITÉ @‏ >	583.62	EGP	2024-04-01	t	2026-05-01 11:33:17.924059
8	1	1	\N	/uploads/bills/1777633527835-537216608.jpg	 فاتورةكهرباء\n\n شركةالكهرباء\n\n فاتورة                                                          ضريبية خدمة تعتمدعليها\n بيانات                                المشترك رقم             الفاتورة‎B          F-2026-00421‏\n اسم       المشترك أحمدمحمد\n                     اسم         أحمد                                                      علي تاريخ                  الإصدار            2026-04-5\n عنوان         الخدمة الرياض؛ حي النخيل. شارع الملكفهد\n رقم         الحساب                                                   10293847 تاريخ           الاستحقاق          2026-05-1\n رقم                  الحساب          10293847جح\n قراءاتالعداد\n نوع           القراءة تاريخ           القراءة            القراءة              ملاحظات رقم                 العداد           ‎MTR-778812‏\n ‏القراءة       السابقة         2026-03-15              12450                                                                      -2\n                             العرفةسكنر\n القراءة          الحالية            2026-04-15                                          12830                                              2ِ\n                                     الاستهلاك 0 كيلوواطز.سن\n ( كيلو واط,س = 1 وحدة)\n تفاصيلالفاتورة\n                                                             البند                                               الوصف المبلغ(ردس)\n الاستهلاك                                           الكهريائي 0 كيلو واط.س ‎x‏ 0.75                                 رس285.00\n المجموع                                                                         الفرعي                                                     -285.00\n ضربية القيمة المضافة                                          )%15( 15% من                                      285.0042.75\n إجمالي المبلغ                                                                            المستحق 5.سس\n معلومات                                                  مهمة ملخص الاستهلاك (كيلوواط.س)\n * يرجى سداد الفاتورة قبل تاريخ الاستحقاق لتجنب تطييق غرامة                           التأخير.                    1          اهل مفارنة معنفس\n ‎٠‏ في حال عدم السداد؛ شر ‎ks‏ تعليق                                                 الخدمة.            الشهر الاستهلاك | الشهر من العامالسايق\n ‎o‏ احتفظ بهذه الفاتورة للرجوع إليها عند                                      الحاجة. أبريل           2026               380 6+\n مارس            2026                3505%+\n                            للتواطل.وَالأسْتَفَسَاز فبرأير         2026            3203%-\n                             8 0         دك يناير       2026          31096\n ‎sams         © www.electricity.sa            ©  oipry‏       2025          34026\n  ‎care@electricity.sa‏ ملاحظة: قد تختلف نسبه المفارنة حسب عدد أيام           الدورة.‎al‏\n ‏2-6 22222222222222222222222222222222ددددددده اقسنم الستداد جد كمد ع كوا يرد‎EE i‏\n طرق السداد                                المتاحة بياناتالسداد\n الحساب البنكي ‎(Obl)‏           105 رقم       الفاتورة:            ‎F-2026-00421‏ امسحللدفع\n مدى / بطاقة        ‎Boll‏ رقم       الحساب:           10293847 عبرالقنوات\n الصراف الألي             1 المبلغ        المستحق: 32175              ‎er‏ الإلكترونيةالمتاحة\n مراكز خدمة المشتركين           ‎A‏ تاريخ      الاستحقاق:2026-05-1\n ‎VF‏ شكرا لاستخدامك الخدمات الإلكترونية للحفاظ علىالبيئة\n\n	شركةالكهرباء	75.00	MAD	2026-04-05	f	2026-05-01 12:05:42.591781
9	1	1	10	/uploads/bills/1777634557691-785320133.jpg	City Market\n\nShopping Receipt\n\nReceipt No:           584219\n\nDate:                   2026-05-01\n\nTime:                 18:42\n\nRegister No:            03\n\nCashier:             Ahmed\n\nNo    Item         Qty Unit Price     Total\n1 Large Bread       1       3.50      3.50 SAR\n2 Milk               2       4.75      9.50 SAR\n3 Basmati Rice      1      34.95     34.95 SAR\n4 Sugar            1       6.25      6.25 SAR\n5 Vegetable Oil            17.95     17.95 SAR\n6 Eggs                    13.50     13.50 SAR\n7 White Cheese      1      22.50     22.50 SAR\n8 Tomatoes                    6.75       6.75 SAR\n9 Cucumber         1        4.25      4.25 SAR\n10 Bananas                  5.25      5.25 SAR\nSubtotal:                            144.65 SAR\nVAT (15%):                    21.70 SAR\n\nJN\n\n584219260501184203\n\n	City Market	584.00	SAR	2026-05-01	t	2026-05-01 12:22:42.001617
10	1	1	11	/uploads/bills/1777656130516-763635581.jpg	CASA FRESH MART\n\n45 Hassan 11 Blvd, Rabat\n0537-555-210\n\n. 2026-05-02\nReceipt No:     20873\nCashier:    Youssef\n\nTomatoes                 2         6.50\nOlive Oil                           42.00\nEggs\n\nYogurt\n\nPasta\n\n اا ‎Ll JR‏اليا\n‎Subtotal                                                .‏\n\n1\n\n1\n\n4\n\nChicken                     1\n3\n\n2\n\n	CASA FRESH MART	555.00	MAD	2026-05-02	t	2026-05-01 18:22:13.690487
11	1	1	12	/uploads/bills/1777656406496-249580816.jpg	CASA FRESH MART\n\n45 Hassan 11 Blvd, Rabat\n0537-555-210\n\n. 2026-05-02\nReceipt No:     20873\nCashier:    Youssef\n\nTomatoes                 2         6.50\nOlive Oil                           42.00\nEggs\n\nYogurt\n\nPasta\n\n اا ‎Ll JR‏اليا\n‎Subtotal                                                .‏\n\n1\n\n1\n\n4\n\nChicken                     1\n3\n\n2\n\n	CASA FRESH MART	555.00	MAD	2026-05-02	t	2026-05-01 18:26:49.903736
\.


--
-- Data for Name: bill_ocr_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_ocr_result (ocr_id, bill_id, image_url, extracted_text, extracted_total, created_at) FROM stdin;
\.


--
-- Data for Name: bill_split; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bill_split (split_id, bill_id, user_id, split_type, percentage, fixed_amount, amount_due, status) FROM stdin;
2	1	2	EQUAL	\N	\N	63.25	UNPAID
4	8	2	PERCENTAGE	30.00	\N	30.00	UNPAID
6	9	2	PERCENTAGE	30.00	\N	15.00	UNPAID
8	10	2	FIXED	\N	46.00	46.00	UNPAID
7	10	1	FIXED	\N	120.00	120.00	PAID
10	12	8	PERCENTAGE	33.33	\N	184.98	UNPAID
11	12	11	PERCENTAGE	33.34	\N	185.04	UNPAID
5	9	1	PERCENTAGE	70.00	\N	35.00	PAID
3	8	1	PERCENTAGE	70.00	\N	70.00	PAID
1	1	1	EQUAL	\N	\N	63.25	PAID
9	12	1	PERCENTAGE	33.33	\N	184.98	UNPAID
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (category_id, name, is_harmful) FROM stdin;
1	Food	f
2	Transport	f
3	Bills	f
4	Education	f
5	Health	f
6	Clothing	f
7	Internet	f
8	Rent	f
9	Entertainment	f
10	Other	f
11	Tobacco	t
12	Alcohol	t
13	Gambling	t
14	Games	t
15	Junk Food	t
\.


--
-- Data for Name: child_points_wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.child_points_wallet (points_wallet_id, child_user_id, parent_user_id, points_balance, conversion_rate) FROM stdin;
1	2	1	500	1.0000
\.


--
-- Data for Name: family_wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.family_wallet (wallet_id, name, country, currency, created_at) FROM stdin;
1	Ahmed Family	Morocco	MAD	2026-04-28 15:23:12.250509
2	my Familly	Morocco	MAD	2026-04-29 20:38:24.18428
3	lskl	Morocco	MAD	2026-04-29 21:21:38.457539
4	My Familly 	Morocco	MAD	2026-04-29 21:26:31.308349
5	Kamal Family	Morocco	MAD	2026-04-30 17:42:41.330839
6	Family 	Morocco	MAD	2026-05-01 16:40:18.672987
7	said familly	Morocco	MAD	2026-05-01 18:09:35.074087
8	said familly	Morocco	MAD	2026-05-01 18:11:45.562487
\.


--
-- Data for Name: join_invite; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.join_invite (invite_id, wallet_id, invite_code, expires_at, used) FROM stdin;
2	2	D58FD2CC98B1	2026-05-06 20:38:24.18428	f
3	3	626BBC333A8E	2026-05-06 21:21:38.457539	t
4	4	F3D34DD3AA44	2026-05-06 21:26:31.308349	f
5	5	DC8F1A506977	2026-05-07 17:42:41.330839	f
6	6	40CE5E33774A	2026-05-08 16:40:18.672987	t
1	1	9B7143BA9DFF	2026-05-05 15:23:12.250509	t
7	7	13D9BE5C63BA	2026-05-08 18:09:35.074087	f
8	8	EEF0D8323DED	2026-05-08 18:11:45.562487	t
\.


--
-- Data for Name: parental_approval_request; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parental_approval_request (approval_id, wallet_id, child_id, category_id, title, amount, currency, status, requested_at, reviewed_by, reviewed_at, decline_reason) FROM stdin;
4	1	2	15	Candy Pack	8.00	MAD	PENDING	2026-04-30 15:55:32.849427	\N	\N	\N
3	1	2	14	New Video Game	45.00	MAD	DECLINED	2026-04-30 15:55:32.849427	1	2026-04-30 21:31:25.911104	Declined by parent
\.


--
-- Data for Name: parental_blocked_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parental_blocked_category (blocked_category_id, wallet_id, category_id, blocked, created_at, updated_at) FROM stdin;
1	1	1	f	2026-04-30 21:31:52.331931	2026-04-30 21:31:52.915101
3	1	15	t	2026-04-30 21:31:58.52246	2026-04-30 22:40:09.7461
6	1	14	t	2026-04-30 22:40:11.600311	2026-04-30 22:40:11.600311
7	1	13	t	2026-04-30 22:40:46.669765	2026-04-30 22:40:46.669765
8	1	12	t	2026-04-30 22:40:47.632058	2026-04-30 22:40:47.632058
9	1	11	t	2026-04-30 22:40:48.452724	2026-04-30 22:43:06.464853
\.


--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment (payment_id, bill_id, user_id, amount, method, paid_at) FROM stdin;
1	1	1	128.15	BANK	2026-04-30 01:22:55.408957
2	1	1	128.00	BANK	2026-05-01 11:11:32.747412
3	6	1	187.00	BANK	2026-05-01 12:26:07.865254
4	10	1	120.00	BANK	2026-05-01 15:02:38.153535
5	12	1	184.98	BANK	2026-05-01 18:33:48.357512
6	9	1	35.00	BANK	2026-05-01 18:35:00.524593
7	8	1	70.00	BANK	2026-05-01 18:35:52.978386
8	11	1	555.00	BANK	2026-05-01 18:36:06.727919
9	1	1	63.25	BANK	2026-05-01 18:37:17.40383
10	11	1	555.00	BANK	2026-05-01 18:37:25.426203
\.


--
-- Data for Name: point_transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.point_transaction (transaction_id, points_wallet_id, child_user_id, bank_account_id, points_amount, real_amount, type, created_at) FROM stdin;
\.


--
-- Name: app_user_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.app_user_user_id_seq', 15, true);


--
-- Name: bank_account_bank_account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bank_account_bank_account_id_seq', 2, true);


--
-- Name: bill_bill_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_bill_id_seq', 12, true);


--
-- Name: bill_item_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_item_item_id_seq', 3, true);


--
-- Name: bill_ocr_draft_ocr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_ocr_draft_ocr_id_seq', 11, true);


--
-- Name: bill_ocr_result_ocr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_ocr_result_ocr_id_seq', 1, false);


--
-- Name: bill_split_split_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bill_split_split_id_seq', 11, true);


--
-- Name: category_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.category_category_id_seq', 15, true);


--
-- Name: child_points_wallet_points_wallet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.child_points_wallet_points_wallet_id_seq', 1, true);


--
-- Name: family_wallet_wallet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.family_wallet_wallet_id_seq', 8, true);


--
-- Name: join_invite_invite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.join_invite_invite_id_seq', 8, true);


--
-- Name: parental_approval_request_approval_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parental_approval_request_approval_id_seq', 4, true);


--
-- Name: parental_blocked_category_blocked_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parental_blocked_category_blocked_category_id_seq', 11, true);


--
-- Name: payment_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_payment_id_seq', 10, true);


--
-- Name: point_transaction_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.point_transaction_transaction_id_seq', 1, false);


--
-- Name: app_user app_user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_email_key UNIQUE (email);


--
-- Name: app_user app_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT app_user_pkey PRIMARY KEY (user_id);


--
-- Name: bank_account bank_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account
    ADD CONSTRAINT bank_account_pkey PRIMARY KEY (bank_account_id);


--
-- Name: bill_item bill_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_item
    ADD CONSTRAINT bill_item_pkey PRIMARY KEY (item_id);


--
-- Name: bill_ocr_draft bill_ocr_draft_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_ocr_draft
    ADD CONSTRAINT bill_ocr_draft_pkey PRIMARY KEY (ocr_id);


--
-- Name: bill_ocr_result bill_ocr_result_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_ocr_result
    ADD CONSTRAINT bill_ocr_result_pkey PRIMARY KEY (ocr_id);


--
-- Name: bill bill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT bill_pkey PRIMARY KEY (bill_id);


--
-- Name: bill_split bill_split_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_split
    ADD CONSTRAINT bill_split_pkey PRIMARY KEY (split_id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- Name: child_points_wallet child_points_wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.child_points_wallet
    ADD CONSTRAINT child_points_wallet_pkey PRIMARY KEY (points_wallet_id);


--
-- Name: family_wallet family_wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.family_wallet
    ADD CONSTRAINT family_wallet_pkey PRIMARY KEY (wallet_id);


--
-- Name: join_invite join_invite_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.join_invite
    ADD CONSTRAINT join_invite_invite_code_key UNIQUE (invite_code);


--
-- Name: join_invite join_invite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.join_invite
    ADD CONSTRAINT join_invite_pkey PRIMARY KEY (invite_id);


--
-- Name: parental_approval_request parental_approval_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_approval_request
    ADD CONSTRAINT parental_approval_request_pkey PRIMARY KEY (approval_id);


--
-- Name: parental_blocked_category parental_blocked_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_blocked_category
    ADD CONSTRAINT parental_blocked_category_pkey PRIMARY KEY (blocked_category_id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (payment_id);


--
-- Name: point_transaction point_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_transaction
    ADD CONSTRAINT point_transaction_pkey PRIMARY KEY (transaction_id);


--
-- Name: parental_blocked_category unique_blocked_category_per_wallet; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_blocked_category
    ADD CONSTRAINT unique_blocked_category_per_wallet UNIQUE (wallet_id, category_id);


--
-- Name: parental_approval_request fk_approval_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_approval_request
    ADD CONSTRAINT fk_approval_category FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE SET NULL;


--
-- Name: parental_approval_request fk_approval_child; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_approval_request
    ADD CONSTRAINT fk_approval_child FOREIGN KEY (child_id) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: parental_approval_request fk_approval_reviewed_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_approval_request
    ADD CONSTRAINT fk_approval_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES public.app_user(user_id) ON DELETE SET NULL;


--
-- Name: parental_approval_request fk_approval_wallet; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_approval_request
    ADD CONSTRAINT fk_approval_wallet FOREIGN KEY (wallet_id) REFERENCES public.family_wallet(wallet_id) ON DELETE CASCADE;


--
-- Name: bank_account fk_bank_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_account
    ADD CONSTRAINT fk_bank_user FOREIGN KEY (user_id) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: bill fk_bill_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT fk_bill_category FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;


--
-- Name: bill fk_bill_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT fk_bill_creator FOREIGN KEY (created_by) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: bill fk_bill_wallet; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill
    ADD CONSTRAINT fk_bill_wallet FOREIGN KEY (wallet_id) REFERENCES public.family_wallet(wallet_id) ON DELETE CASCADE;


--
-- Name: parental_blocked_category fk_blocked_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_blocked_category
    ADD CONSTRAINT fk_blocked_category FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;


--
-- Name: parental_blocked_category fk_blocked_wallet; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parental_blocked_category
    ADD CONSTRAINT fk_blocked_wallet FOREIGN KEY (wallet_id) REFERENCES public.family_wallet(wallet_id) ON DELETE CASCADE;


--
-- Name: join_invite fk_invite_wallet; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.join_invite
    ADD CONSTRAINT fk_invite_wallet FOREIGN KEY (wallet_id) REFERENCES public.family_wallet(wallet_id) ON DELETE CASCADE;


--
-- Name: bill_item fk_item_bill; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_item
    ADD CONSTRAINT fk_item_bill FOREIGN KEY (bill_id) REFERENCES public.bill(bill_id) ON DELETE CASCADE;


--
-- Name: bill_ocr_result fk_ocr_bill; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_ocr_result
    ADD CONSTRAINT fk_ocr_bill FOREIGN KEY (bill_id) REFERENCES public.bill(bill_id) ON DELETE CASCADE;


--
-- Name: bill_ocr_draft fk_ocr_bill; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_ocr_draft
    ADD CONSTRAINT fk_ocr_bill FOREIGN KEY (bill_id) REFERENCES public.bill(bill_id) ON DELETE SET NULL;


--
-- Name: bill_ocr_draft fk_ocr_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_ocr_draft
    ADD CONSTRAINT fk_ocr_user FOREIGN KEY (user_id) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: bill_ocr_draft fk_ocr_wallet; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_ocr_draft
    ADD CONSTRAINT fk_ocr_wallet FOREIGN KEY (wallet_id) REFERENCES public.family_wallet(wallet_id) ON DELETE CASCADE;


--
-- Name: payment fk_payment_bill; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES public.bill(bill_id) ON DELETE CASCADE;


--
-- Name: payment fk_payment_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: child_points_wallet fk_points_child; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.child_points_wallet
    ADD CONSTRAINT fk_points_child FOREIGN KEY (child_user_id) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: child_points_wallet fk_points_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.child_points_wallet
    ADD CONSTRAINT fk_points_parent FOREIGN KEY (parent_user_id) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: bill_split fk_split_bill; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_split
    ADD CONSTRAINT fk_split_bill FOREIGN KEY (bill_id) REFERENCES public.bill(bill_id) ON DELETE CASCADE;


--
-- Name: bill_split fk_split_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bill_split
    ADD CONSTRAINT fk_split_user FOREIGN KEY (user_id) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: point_transaction fk_transaction_bank; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_transaction
    ADD CONSTRAINT fk_transaction_bank FOREIGN KEY (bank_account_id) REFERENCES public.bank_account(bank_account_id) ON DELETE SET NULL;


--
-- Name: point_transaction fk_transaction_child; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_transaction
    ADD CONSTRAINT fk_transaction_child FOREIGN KEY (child_user_id) REFERENCES public.app_user(user_id) ON DELETE CASCADE;


--
-- Name: point_transaction fk_transaction_points_wallet; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_transaction
    ADD CONSTRAINT fk_transaction_points_wallet FOREIGN KEY (points_wallet_id) REFERENCES public.child_points_wallet(points_wallet_id) ON DELETE CASCADE;


--
-- Name: app_user fk_user_wallet; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_user
    ADD CONSTRAINT fk_user_wallet FOREIGN KEY (wallet_id) REFERENCES public.family_wallet(wallet_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict N4k4mYISmCvg4aPVDpdKTfMEFKCL2h3aQNmSPYQJO5JLMbpgPgbG2aU5E0DfT9n

