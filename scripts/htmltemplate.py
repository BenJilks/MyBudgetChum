import sys, re

def resolve_template(file_path):
    with open(file_path, 'r') as f:
        input_content = f.read()

    out = ''
    while len(input_content) > 0:
        handle = re.search('{{.*}}', input_content)
        if handle == None:
            out += input_content
            break

        template = resolve_template(handle.group(0)[2:-2])
        span = handle.span()
        out += input_content[:span[0]] + template
        input_content = input_content[span[1]:]
    return out

def main():
    if len(sys.argv) <= 2:
        print('Usage: [input_file] [output_file]')

    with open(sys.argv[2], 'w') as f:
        f.write(resolve_template(sys.argv[1]))

if __name__ == '__main__':
    main()

