#!/bin/bash
sed -i -e '71,82d' server.ts
sed -i -e '/\${userSpecificDirectives}/d' server.ts
