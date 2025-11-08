import tkinter as tk
from tkinter import ttk


class MainApplication(tk.Tk):
    """
    Hauptanwendungsklasse, für das Visualisierungstool.
    """

    def __init__(self):
        super().__init__()

        self.title("Visualisierungstool")
        self.geometry("800x800")
        self.minsize(300, 300)

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)

        # --


class FilePicker(tk.Frame):
    """
    Frame um die zu visualisierende Datei zu wählen
    """

    def __init__(self, master):
        super().__init__(master)

    def _open_file_dialog():
        pass
