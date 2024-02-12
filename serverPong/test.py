import logging
import sys

root = logging.getLogger()
root.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stderr)
handler.setLevel(logging.INFO)

formatter = logging.basicConfig(format="%(asctime)s: %(message)s'")
handler.setFormatter(formatter)

root.addHandler(handler)

log = logging.getLogger(__name__)
log.info("test")
