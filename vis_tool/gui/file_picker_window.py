import tkinter as tk
from tkinter import ttk
from tkinter import filedialog
from gui.main_window import MainApplicationWindow


class FilePicker(tk.Tk):
    """
    Datei-Auswahlfenster.
    """

    def __init__(self):
        super().__init__()

        self.title("Datei-Auswahl")
        self.geometry("400x200")
        self.minsize(300, 200)

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)

        # Widgets und Layout hier hinzufügen
        frame = ttk.Frame(self)
        frame.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        frame.grid_rowconfigure(0, weight=1)
        frame.grid_columnconfigure(0, weight=1)

        label = ttk.Label(frame, text="Wählen Sie eine Datei aus:")
        label.grid(row=0, column=0, sticky="w")
        # Weitere Widgets wie Dateiauswahl-Buttons, Listen etc. können hier hinzugefügt werden

        # Button um filedialog zu öffnen
        button = ttk.Button(frame, text="Datei auswählen", command=self.open_file_dialog)
        button.grid(row=1, column=0, sticky="w", pady=10)

    def open_file_dialog(self):
        file_path = filedialog.askopenfilename()
        if not file_path:
            return

        # Neues Fenster öffnen
        self.destroy()

        MainApplicationWindow(file_path).mainloop()

