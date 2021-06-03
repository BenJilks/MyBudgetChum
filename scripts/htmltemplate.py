import sys, re
from time import sleep
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

def resolve_template(file_path):
    with open(file_path, 'r') as f:
        input_content = f.read()

    out = ''
    while len(input_content) > 0:
        handle = re.search('{{.*}}', input_content)
        if handle == None:
            out += input_content
            break

        template = resolve_template(handle.group(0)[2:-2].strip())
        span = handle.span()
        out += input_content[:span[0]] + template
        input_content = input_content[span[1]:]
    return out

def update_file(input_path, output_path):
    with open(output_path, 'w') as f:
        f.write(resolve_template(input_path))

class Watch(FileSystemEventHandler):
    def __init__(self, input_path, output_path):
        self._input_path = input_path
        self._output_path = output_path

    def on_modified(self, event):
        update_file(self._input_path, self._output_path)

def main():
    if len(sys.argv) <= 2:
        print('Usage: [input_file] [output_file]')

    watch = False
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    if len(sys.argv) >= 4 and input_path == '-w':
        watch = True
        input_path = output_path
        output_path = sys.argv[3]

    if watch:
        handler = Watch(input_path, output_path)
        observer = Observer()
        observer.schedule(handler, path=input_path, recursive=False)
        observer.start()

        print('Watching file ' + input_path + ', press Ctrl-C to stop')
        while True:
            try:
                sleep(100000)
            except KeyboardInterrupt:
                observer.stop()
                break
    else:
        update_file(input_path, output_path)

if __name__ == '__main__':
    main()

