import sys, re
import os.path
from time import sleep
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

def decode_handle(handle: str) -> (str, {str: str}):
    parts = handle.strip().split(' ')
    if len(parts) < 1:
        return None, None
    
    vars = {}
    for part in parts[1:]:
        name, value = part.split('=')
        vars[name] = value
    return parts[0], vars

def resolve_template(file_path: str, vars: {str: str} = {}) -> (str, [str]):
    if not os.path.isfile(file_path):
        return "{{ Error, no such file '%s' }}"%file_path, []

    with open(file_path, 'r') as f:
        input_content = f.read()
        for name in vars:
            input_content = re.sub('{{\\s*' + name + '\\s*}}', vars[name], input_content)

    out = ''
    dependencies = [file_path]
    while len(input_content) > 0:
        handle = re.search('{{.*}}', input_content)
        if handle == None:
            out += input_content
            break

        file_path, vars = decode_handle(handle.group(0)[2:-2])
        if file_path != None:
            template, sub_dependencies = resolve_template(file_path, vars)
            dependencies += sub_dependencies
        else:
            template = "{{ Invalid handle '" + handle.group(0)[2:-2] + "' }}"

        span = handle.span()
        out += input_content[:span[0]] + template
        input_content = input_content[span[1]:]
    return out, dependencies

def update_file(input_path: str, output_path: str) -> [str]:
    with open(output_path, 'w') as f:
        content, dependencies = resolve_template(input_path)
        f.write(content)
    
    return dependencies

class Watch(FileSystemEventHandler):
    def __init__(self, input_path: str, output_path: str, observer: Observer):
        self._input_path = input_path
        self._output_path = output_path
        self._observer = observer

    def on_modified(self, event):
        # Recompile the file
        dependencies = update_file(self._input_path, self._output_path)

        # Update our dependencies
        self._observer.unschedule_all()
        for dependency in dependencies:
            self._observer.schedule(self, path=dependency, recursive=False)

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

    dependencies = update_file(input_path, output_path)
    if watch:
        observer = Observer()
        handler = Watch(input_path, output_path, observer)
        for dependency in dependencies:
            observer.schedule(handler, path=dependency, recursive=False)
        observer.start()

        print('Watching file ' + input_path + ', press Ctrl-C to stop')
        while True:
            try:
                sleep(100000)
            except KeyboardInterrupt:
                observer.stop()
                break

if __name__ == '__main__':
    main()

