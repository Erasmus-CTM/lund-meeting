from ingest.ingest_config import load_ingest_config


def main():
    print("hello from ingest...")
    conf = load_ingest_config()
    print(conf)


if __name__ == "__main__":
    main()
