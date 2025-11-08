import tkinter as tk
from tkinter import ttk
from tkinter import filedialog


class MainApplicationWindow(tk.Tk):
    """
    Hauptanwendungsklasse, für das Visualisierungstool.
    """

    def __init__(self, filepath: str):
        super().__init__()
        self.filepath = filepath
        
        # Dark theme colors
        self.colors = {
            'bg_primary': '#1e1e1e',      # Haupthintergrund
            'bg_secondary': '#2d2d30',     # Sekundärer Hintergrund
            'bg_accent': '#3e3e42',        # Akzent/Hover
            'fg_primary': '#ffffff',       # Haupttext
            'fg_secondary': '#cccccc',     # Sekundärtext
            'accent_blue': '#007acc',      # Blauer Akzent
            'accent_hover': '#1177dd'      # Hover-Blau
        }

        self.setup_window()
        self.setup_styles()
        self.create_widgets()

    def setup_window(self):
        """Grundlegende Fensterkonfiguration"""
        self.title("Visualisierungstool")
        self.geometry("900x700")
        self.minsize(600, 500)
        self.configure(bg=self.colors['bg_primary'])
        
        # Center window on screen
        self.center_window()

    def center_window(self):
        """Fenster in der Bildschirmmitte positionieren"""
        self.update_idletasks()
        width = self.winfo_width()
        height = self.winfo_height()
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f'{width}x{height}+{x}+{y}')

    def setup_styles(self):
        """TTK Styles für dunkles Theme konfigurieren"""
        style = ttk.Style()
        
        # Configure OptionMenu style
        style.theme_use('clam')
        style.configure('Dark.TMenubutton',
                       background=self.colors['bg_secondary'],
                       foreground=self.colors['fg_primary'],
                       borderwidth=1,
                       focuscolor='none',
                       relief='flat')
        style.map('Dark.TMenubutton',
                 background=[('active', self.colors['accent_blue'])])

    def create_widgets(self):
        """Hauptwidgets erstellen"""
        # Main container
        main_container = tk.Frame(self, bg=self.colors['bg_primary'])
        main_container.pack(fill='both', expand=True, padx=30, pady=20)
        
        # Title
        title_label = tk.Label(
            main_container,
            text="Datenvisualisierung",
            font=('Segoe UI', 20, 'bold'),
            bg=self.colors['bg_primary'],
            fg=self.colors['fg_primary']
        )
        title_label.pack(pady=(0, 30))
        
        # Visualization selection section
        self.create_visualization_section(main_container)
        
        # Separator
        separator = tk.Frame(main_container, height=2, bg=self.colors['bg_accent'])
        separator.pack(fill='x', pady=20)
        
        # Configuration section
        self.create_configuration_section(main_container)

    def create_visualization_section(self, parent):
        """Visualisierungsauswahl-Sektion erstellen"""
        vis_frame = tk.Frame(parent, bg=self.colors['bg_primary'])
        vis_frame.pack(fill='x', pady=(0, 20))
        
        # Section title
        section_title = tk.Label(
            vis_frame,
            text="Visualisierungstyp auswählen",
            font=('Segoe UI', 14, 'bold'),
            bg=self.colors['bg_primary'],
            fg=self.colors['fg_primary']
        )
        section_title.pack(anchor='w', pady=(0, 15))
        
        # Dropdown container
        dropdown_container = tk.Frame(vis_frame, bg=self.colors['bg_primary'])
        dropdown_container.pack(anchor='w')
        
        # Dropdown options  
        visualization_types = ["Box Plot", "Scatterplot", "Barchart", "Stackplot"]  
        self.opt = tk.StringVar(value="Box Plot")
        
        # Custom styled dropdown
        self.dropdown = ttk.OptionMenu(
            dropdown_container,
            self.opt,
            visualization_types[0],
            *visualization_types,
            style='Dark.TMenubutton'
        )
        self.dropdown.configure(width=20)
        self.dropdown.pack(side='left')
        
        # Configure button
        configure_btn = tk.Button(
            dropdown_container,
            text="Spalten konfigurieren",
            command=self.configure_columns,
            font=('Segoe UI', 10),
            bg=self.colors['accent_blue'],
            fg=self.colors['bg_primary'],
            activebackground=self.colors['accent_hover'],
            activeforeground=self.colors['fg_primary'],
            relief='flat',
            padx=20,
            pady=8,
            cursor='hand2'
        )
        configure_btn.pack(side='left', padx=(20, 0))

    def create_configuration_section(self, parent):
        """Konfigurationssektion erstellen"""
        config_frame = tk.Frame(parent, bg=self.colors['bg_primary'])
        config_frame.pack(fill='both', expand=True)
        
        # Section title
        self.config_title = tk.Label(
            config_frame,
            text="Spaltenkonfiguration",
            font=('Segoe UI', 14, 'bold'),
            bg=self.colors['bg_primary'],
            fg=self.colors['fg_primary']
        )
        self.config_title.pack(anchor='w', pady=(0, 15))
        
        # Scrollable column frame
        canvas = tk.Canvas(
            config_frame,
            bg=self.colors['bg_secondary'],
            highlightthickness=0,
            relief='flat'
        )
        scrollbar = ttk.Scrollbar(config_frame, orient="vertical", command=canvas.yview)
        
        self.column_frame = tk.Frame(canvas, bg=self.colors['bg_secondary'])
        self.column_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=self.column_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Initial message
        self.show_initial_message()

    def show_initial_message(self):
        """Anfangsnachricht anzeigen"""
        msg_label = tk.Label(
            self.column_frame,
            text="Klicken Sie auf 'Spalten konfigurieren', um zu beginnen.",
            font=('Segoe UI', 11),
            bg=self.colors['bg_secondary'],
            fg=self.colors['fg_secondary'],
            pady=20
        )
        msg_label.pack(expand=True)

    def configure_columns(self):
        # Clear previous widgets
        for w in self.column_frame.winfo_children():
            w.destroy()

        vis = self.opt.get()
        
        # Add padding container
        container = tk.Frame(self.column_frame, bg=self.colors['bg_secondary'])
        container.pack(fill='both', expand=True, padx=20, pady=20)

        def make_entry(label_text, row, default="", required=True):
            # Row container
            row_frame = tk.Frame(container, bg=self.colors['bg_secondary'])
            row_frame.pack(fill='x', pady=8)
            row_frame.grid_columnconfigure(1, weight=1)

            # Label with required indicator
            label_display = f"{label_text} {'*' if required else ''}"
            lbl = tk.Label(
                row_frame,
                text=label_display,
                font=('Segoe UI', 11),
                bg=self.colors['bg_secondary'],
                fg=self.colors['fg_primary'] if required else self.colors['fg_secondary'],
                width=25,
                anchor='w'
            )
            lbl.grid(row=0, column=0, sticky="w", padx=(0, 15))

            # Entry
            var = tk.StringVar(value=default)
            ent = tk.Entry(
                row_frame,
                textvariable=var,
                font=('Segoe UI', 10),
                bg=self.colors['bg_accent'],
                fg=self.colors['fg_primary'],
                insertbackground=self.colors['fg_primary'],
                relief='flat',
                bd=0,
                highlightthickness=1,
                highlightcolor=self.colors['accent_blue'],
                highlightbackground=self.colors['bg_accent']
            )
            ent.grid(row=0, column=1, sticky="we", padx=(0, 10))
            
            # Add some padding to entry
            ent.configure(font=('Segoe UI', 10), relief='flat', bd=5)

            return var, ent

        if vis == "Box Plot":
            self.x_value, self.x_entry = make_entry("X-Spalte:", 0)
            self.y_value, self.y_entry = make_entry("Y-Spalte:", 1)
            self.group_value, self.group_entry = make_entry("Gruppierung:", 2, required=False)
        elif vis == "Scatterplot":
            self.x_value, self.x_entry = make_entry("X-Spalte:", 0)
            self.y_value, self.y_entry = make_entry("Y-Spalte:", 1)
            self.color_value, self.color_entry = make_entry("Farbe:", 2, required=False)
            self.size_value, self.size_entry = make_entry("Größe:", 3, required=False)
        elif vis == "Barchart":
            self.category_value, self.category_entry = make_entry("Kategorie-Spalte:", 0)
            self.value_value, self.value_entry = make_entry("Wert-Spalte:", 1)
            self.orientation_value, self.orientation_entry = make_entry("Ausrichtung:", 2, "vertikal", False)
        elif vis == "Stackplot":
            self.x_value, self.x_entry = make_entry("X-Spalte:", 0)
            self.y_values, self.y_entry = make_entry("Y-Spalten (durch Komma getrennt):", 1)
        else:
            # fallback: show message
            lbl = tk.Label(
                container,
                text="Keine Konfiguration für die ausgewählte Visualisierung vorhanden.",
                font=('Segoe UI', 11),
                bg=self.colors['bg_secondary'],
                fg=self.colors['fg_secondary']
            )
            lbl.pack(pady=20)

        # Add legend for required fields
        if vis in ["Box Plot", "Scatterplot", "Barchart", "Stackplot"]:
            legend_label = tk.Label(
                container,
                text="* Pflichtfelder",
                font=('Segoe UI', 9),
                bg=self.colors['bg_secondary'],
                fg=self.colors['fg_secondary']
            )
            legend_label.pack(anchor='w', pady=(20, 0))

        self.column_frame.update_idletasks()


class BoxPlotFrame(tk.Frame):
    """
    Frame für Konfiguration der BoxPlot Visualisierung 
    """
    def __init__(self):
        super().__init__()
