#!/usr/bin/env python

import sys

sys.stdout.write('Mocking queue execution. args: ' + str(sys.argv[1:]))

if 'fail' in sys.argv[1:]:
    sys.exit(1)
else:
    sys.exit(0)
